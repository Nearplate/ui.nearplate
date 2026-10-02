import { revalidatePath } from "next/cache"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { getAccessToken, getSession } from "@/features/auth/session"
import {
  createRestaurant,
  updateRestaurant,
} from "@/features/restaurant/api/restaurant-api"
import { ApiError } from "@/lib/api/client"

import {
  confirmDocumentUploadAction,
  removeDocumentAction,
  requestDocumentUploadAction,
  saveBankAction,
  saveDetailsAction,
  saveIdentityAction,
  submitForReviewAction,
} from "./actions"
import {
  confirmDocumentUpload,
  createDocumentUpload,
  deleteDocument,
  getKyc,
  listDocuments,
  submitForReview,
  updateKyc,
} from "./api/onboarding-api"
import { IDLE_FORM } from "./form-state"
import { DOCUMENT_TYPES } from "./constants"
import { EMPTY_KYC, type RestaurantDocument } from "./schemas"

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`)
  }),
}))
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }))
vi.mock("@/features/auth/session", () => ({
  getAccessToken: vi.fn(),
  getSession: vi.fn(),
}))
vi.mock("@/features/auth/api/user-api", () => ({ onboard: vi.fn() }))
vi.mock("@/features/restaurant/api/restaurant-api")
vi.mock("./api/onboarding-api")

function form(values: Record<string, string>): FormData {
  const data = new FormData()
  for (const [key, value] of Object.entries(values)) data.set(key, value)
  return data
}

function uploaded(type: (typeof DOCUMENT_TYPES)[number]): RestaurantDocument {
  return {
    type,
    status: "uploaded",
    contentType: "image/png",
    size: 1,
    url: "https://s3.test/x",
    updatedAt: "2026-10-02T00:00:00Z",
  }
}

const DETAILS = {
  name: "Tasty Bites",
  cuisines: "Indian, Chinese",
  lat: "12.9",
  lng: "77.6",
  line1: "1 MG Road",
  city: "Bengaluru",
  state: "KA",
  zipcode: "560001",
  phoneNumber: "9876543210",
}

const API_MOCKS = [
  confirmDocumentUpload,
  createDocumentUpload,
  createRestaurant,
  deleteDocument,
  getKyc,
  listDocuments,
  submitForReview,
  updateKyc,
  updateRestaurant,
]

beforeEach(() => {
  vi.clearAllMocks()
  for (const mock of API_MOCKS) vi.mocked(mock).mockReset()
  vi.mocked(getAccessToken).mockResolvedValue("token")
  vi.mocked(getSession).mockResolvedValue({ isOnboarded: true } as never)
})

describe("saveDetailsAction", () => {
  it("creates the restaurant when there is none, then moves to identity", async () => {
    await expect(saveDetailsAction(IDLE_FORM, form(DETAILS))).rejects.toThrow(
      "REDIRECT:/restaurant/onboarding?step=identity"
    )

    expect(createRestaurant).toHaveBeenCalledWith(
      "token",
      expect.objectContaining({
        name: "Tasty Bites",
        cuisines: ["indian", "chinese"],
      })
    )
    expect(updateRestaurant).not.toHaveBeenCalled()
  })

  it("updates the existing restaurant on re-save", async () => {
    await expect(
      saveDetailsAction(IDLE_FORM, form({ ...DETAILS, restaurantId: "r1" }))
    ).rejects.toThrow("REDIRECT:/restaurant/onboarding?step=identity")

    expect(updateRestaurant).toHaveBeenCalledWith(
      "token",
      "r1",
      expect.objectContaining({ name: "Tasty Bites" })
    )
    expect(createRestaurant).not.toHaveBeenCalled()
  })

  it("returns an error for invalid details without calling the API", async () => {
    const result = await saveDetailsAction(
      IDLE_FORM,
      form({ ...DETAILS, name: "" })
    )

    expect(result).toMatchObject({ status: "error" })
    expect(createRestaurant).not.toHaveBeenCalled()
  })

  it("maps an API failure to a message", async () => {
    vi.mocked(createRestaurant).mockRejectedValue(new ApiError(503))

    const result = await saveDetailsAction(IDLE_FORM, form(DETAILS))

    expect(result).toMatchObject({
      status: "error",
      message: "Something went wrong. Please try again.",
    })
  })
})

describe("saveIdentityAction", () => {
  const IDENTITY_DOCS = [
    "aadhaar_front",
    "aadhaar_back",
    "pan_front",
    "pan_back",
    "fssai_certificate",
  ] as const

  it("sends only the fields that were filled in", async () => {
    vi.mocked(getKyc).mockResolvedValue({
      ...EMPTY_KYC,
      fssaiNumber: "12345678901234",
    })
    vi.mocked(listDocuments).mockResolvedValue(IDENTITY_DOCS.map(uploaded))

    await expect(
      saveIdentityAction(
        IDLE_FORM,
        form({ restaurantId: "r1", panNumber: "abcde1234f", fssaiNumber: "" })
      )
    ).rejects.toThrow("REDIRECT:/restaurant/onboarding?step=bank")

    expect(updateKyc).toHaveBeenCalledWith("token", "r1", {
      panNumber: "ABCDE1234F",
    })
  })

  it("skips the PATCH when everything is already saved", async () => {
    vi.mocked(getKyc).mockResolvedValue({
      ...EMPTY_KYC,
      panNumber: "XXXXX1234F",
      fssaiNumber: "12345678901234",
    })
    vi.mocked(listDocuments).mockResolvedValue(IDENTITY_DOCS.map(uploaded))

    await expect(
      saveIdentityAction(IDLE_FORM, form({ restaurantId: "r1" }))
    ).rejects.toThrow("REDIRECT:")

    expect(updateKyc).not.toHaveBeenCalled()
  })

  it("reports field errors for a bad PAN", async () => {
    const result = await saveIdentityAction(
      IDLE_FORM,
      form({ restaurantId: "r1", panNumber: "nope" })
    )

    expect(result).toMatchObject({
      status: "error",
      fieldErrors: { panNumber: expect.any(String) },
    })
    expect(updateKyc).not.toHaveBeenCalled()
  })

  it("requires numbers that are neither saved nor entered", async () => {
    vi.mocked(getKyc).mockResolvedValue(EMPTY_KYC)
    vi.mocked(listDocuments).mockResolvedValue(IDENTITY_DOCS.map(uploaded))

    const result = await saveIdentityAction(
      IDLE_FORM,
      form({ restaurantId: "r1" })
    )

    expect(result).toMatchObject({
      status: "error",
      fieldErrors: {
        panNumber: expect.any(String),
        fssaiNumber: expect.any(String),
      },
    })
  })

  it("blocks when a document is missing", async () => {
    vi.mocked(getKyc).mockResolvedValue({
      ...EMPTY_KYC,
      panNumber: "XXXXX1234F",
      fssaiNumber: "12345678901234",
    })
    vi.mocked(listDocuments).mockResolvedValue([uploaded("aadhaar_front")])

    const result = await saveIdentityAction(
      IDLE_FORM,
      form({ restaurantId: "r1" })
    )

    expect(result).toMatchObject({
      status: "error",
      message: "Upload every document on this step to continue.",
    })
  })

  it("explains the lock when the restaurant is under review", async () => {
    vi.mocked(getKyc).mockResolvedValue({
      ...EMPTY_KYC,
      fssaiNumber: "12345678901234",
    })
    vi.mocked(listDocuments).mockResolvedValue(IDENTITY_DOCS.map(uploaded))
    vi.mocked(updateKyc).mockRejectedValue(
      new ApiError(409, "RESTAURANT_ONBOARDING_LOCKED")
    )

    const result = await saveIdentityAction(
      IDLE_FORM,
      form({ restaurantId: "r1", panNumber: "ABCDE1234F" })
    )

    expect(result).toMatchObject({
      status: "error",
      message: "Your details are under review and can't be changed.",
    })
  })
})

describe("saveBankAction", () => {
  const BANK = {
    restaurantId: "r1",
    accountHolderName: "Tasty Bites",
    accountNumber: "123456789012",
    confirmAccountNumber: "123456789012",
    ifscCode: "HDFC0001234",
    bankName: "HDFC",
  }

  it("never sends the confirmation field to the API", async () => {
    vi.mocked(getKyc).mockResolvedValue(EMPTY_KYC)
    vi.mocked(listDocuments).mockResolvedValue([uploaded("bank_proof")])

    await expect(saveBankAction(IDLE_FORM, form(BANK))).rejects.toThrow(
      "REDIRECT:/restaurant/onboarding?step=review"
    )

    expect(updateKyc).toHaveBeenCalledWith("token", "r1", {
      accountHolderName: "Tasty Bites",
      accountNumber: "123456789012",
      ifscCode: "HDFC0001234",
      bankName: "HDFC",
    })
  })

  it("rejects mismatched account numbers", async () => {
    const result = await saveBankAction(
      IDLE_FORM,
      form({ ...BANK, confirmAccountNumber: "999999999999" })
    )

    expect(result).toMatchObject({
      status: "error",
      fieldErrors: { confirmAccountNumber: "Account numbers don't match." },
    })
  })
})

describe("document actions", () => {
  it("requests a presigned upload", async () => {
    const presigned = {
      type: "pan_front" as const,
      url: "https://s3.test/b",
      fields: { key: "k" },
      expiresAt: "2026-10-02T01:00:00Z",
    }
    vi.mocked(createDocumentUpload).mockResolvedValue(presigned)

    const result = await requestDocumentUploadAction(
      "r1",
      "pan_front",
      "image/png",
      1000
    )

    expect(result).toEqual({ ok: true, data: presigned })
  })

  it("rejects an invalid size without calling the API", async () => {
    const result = await requestDocumentUploadAction(
      "r1",
      "pan_front",
      "image/png",
      0
    )

    expect(result.ok).toBe(false)
    expect(createDocumentUpload).not.toHaveBeenCalled()
  })

  it("maps a confirm mismatch to a message", async () => {
    vi.mocked(confirmDocumentUpload).mockRejectedValue(
      new ApiError(409, "RESTAURANT_DOCUMENT_UPLOAD_MISMATCH")
    )

    const result = await confirmDocumentUploadAction("r1", "pan_front")

    expect(result).toEqual({
      ok: false,
      message: "Upload didn't complete. Try again.",
    })
  })

  it("revalidates after confirm and remove", async () => {
    vi.mocked(confirmDocumentUpload).mockResolvedValue(uploaded("pan_front"))

    await confirmDocumentUploadAction("r1", "pan_front")
    await removeDocumentAction("r1", "pan_front")

    expect(deleteDocument).toHaveBeenCalledWith("token", "r1", "pan_front")
    expect(revalidatePath).toHaveBeenCalledTimes(2)
  })

  it("rejects an unknown document type", async () => {
    const result = await removeDocumentAction("r1", "selfie" as never)

    expect(result.ok).toBe(false)
    expect(deleteDocument).not.toHaveBeenCalled()
  })
})

describe("submitForReviewAction", () => {
  it("submits and redirects to the review page", async () => {
    await expect(
      submitForReviewAction(IDLE_FORM, form({ restaurantId: "r1" }))
    ).rejects.toThrow("REDIRECT:/restaurant/onboarding/review")

    expect(submitForReview).toHaveBeenCalledWith("token", "r1")
  })

  it("shows the incomplete message on a 409", async () => {
    vi.mocked(submitForReview).mockRejectedValue(
      new ApiError(409, "RESTAURANT_INCOMPLETE")
    )

    const result = await submitForReviewAction(
      IDLE_FORM,
      form({ restaurantId: "r1" })
    )

    expect(result).toMatchObject({
      status: "error",
      message: "Some details are still missing.",
    })
  })
})
