import { beforeEach, describe, expect, it, vi } from "vitest"

import { updateMe } from "@/features/auth/api/user-api"
import { getAccessToken } from "@/features/auth/session"

import { createAddress, deleteAddress, updateAddress } from "./api/address-api"
import {
  deleteAddressAction,
  saveAddressAction,
  setDefaultAddressAction,
  updateAccountProfileAction,
} from "./actions"

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`)
  }),
}))
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }))
vi.mock("@/features/auth/api/user-api")
vi.mock("@/features/auth/session", () => ({
  getAccessToken: vi.fn(),
}))
vi.mock("./api/address-api")

const IDLE = { status: "idle" } as const

function form(values: Record<string, string>): FormData {
  const data = new FormData()
  Object.entries(values).forEach(([key, value]) => data.set(key, value))
  return data
}

const ADDRESS_FORM = {
  label: "Home",
  line1: "221B Baker Street",
  city: "Mumbai",
  state: "MH",
  zipcode: "400001",
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getAccessToken).mockResolvedValue("at")
})

describe("updateAccountProfileAction", () => {
  it("rejects an invalid phone number without calling the API", async () => {
    const state = await updateAccountProfileAction(
      IDLE,
      form({ phoneNumber: "not-a-phone" })
    )

    expect(state).toEqual({
      status: "error",
      message: "Check your details and try again.",
    })
    expect(updateMe).not.toHaveBeenCalled()
  })

  it("sends only the changed fields and succeeds", async () => {
    vi.mocked(updateMe).mockResolvedValue(undefined as never)

    const state = await updateAccountProfileAction(
      IDLE,
      form({
        firstName: "Ada",
        lastName: "",
        phoneNumber: "",
        dateOfBirth: "",
        anniversaryDate: "",
        gender: "",
      })
    )

    expect(state).toEqual({ status: "success" })
    expect(updateMe).toHaveBeenCalledWith("at", {
      firstName: "Ada",
      phoneNumber: null,
      dateOfBirth: null,
      anniversaryDate: null,
      gender: null,
    })
  })

  it("redirects to /auth when there is no session", async () => {
    vi.mocked(getAccessToken).mockResolvedValue(null)

    await expect(
      updateAccountProfileAction(
        IDLE,
        form({
          firstName: "Ada",
          lastName: "",
          phoneNumber: "",
          dateOfBirth: "",
          anniversaryDate: "",
          gender: "",
        })
      )
    ).rejects.toThrow("REDIRECT:/auth")
  })
})

describe("saveAddressAction", () => {
  it("rejects a missing required field without calling the API", async () => {
    const state = await saveAddressAction(IDLE, form({ label: "Home" }))

    expect(state).toEqual({
      status: "error",
      message: "Check the address details.",
    })
    expect(createAddress).not.toHaveBeenCalled()
  })

  it("creates a new address when there is no addressId", async () => {
    vi.mocked(createAddress).mockResolvedValue({} as never)

    const state = await saveAddressAction(IDLE, form(ADDRESS_FORM))

    expect(state).toEqual({ status: "success" })
    expect(createAddress).toHaveBeenCalledWith(
      "at",
      expect.objectContaining({ label: "Home", line1: ADDRESS_FORM.line1 })
    )
  })

  it("updates an existing address when addressId is set", async () => {
    vi.mocked(updateAddress).mockResolvedValue({} as never)

    const state = await saveAddressAction(
      IDLE,
      form({ ...ADDRESS_FORM, addressId: "addr-1" })
    )

    expect(state).toEqual({ status: "success" })
    expect(updateAddress).toHaveBeenCalledWith(
      "at",
      "addr-1",
      expect.objectContaining({ label: "Home" })
    )
  })
})

describe("deleteAddressAction", () => {
  it("deletes the address", async () => {
    await deleteAddressAction("addr-1")
    expect(deleteAddress).toHaveBeenCalledWith("at", "addr-1")
  })
})

describe("setDefaultAddressAction", () => {
  it("sets the address as default", async () => {
    await setDefaultAddressAction("addr-1")
    expect(updateAddress).toHaveBeenCalledWith("at", "addr-1", {
      isDefault: true,
    })
  })
})
