import { describe, expect, it } from "vitest"

import type { OwnerRestaurant } from "@/features/restaurant/schemas"

import { clampStep, documentFileFor, onboardingProgress } from "./progress"
import { EMPTY_KYC, type Kyc, type RestaurantDocument } from "./schemas"
import { DOCUMENT_TYPES, type DocumentType } from "./constants"

const RESTAURANT = { id: "r1" } as OwnerRestaurant

function doc(
  type: DocumentType,
  status: RestaurantDocument["status"] = "uploaded"
): RestaurantDocument {
  return {
    type,
    status,
    contentType: "image/png",
    size: 1,
    url: status === "uploaded" ? "https://s3.test/x" : null,
    updatedAt: "2026-10-02T00:00:00Z",
  }
}

const IDENTITY_KYC: Partial<Kyc> = {
  panNumber: "XXXXX1234F",
  fssaiNumber: "12345678901234",
}
const BANK_KYC: Partial<Kyc> = {
  accountHolderName: "Tasty Bites",
  accountNumber: "XXXXXXXXXXXX3456",
  ifscCode: "HDFC0001234",
  bankName: "HDFC",
}
const ALL_DOCS = DOCUMENT_TYPES.map((type) => doc(type))

describe("onboardingProgress", () => {
  it("starts at details when there is no restaurant", () => {
    const progress = onboardingProgress({
      restaurant: null,
      kyc: EMPTY_KYC,
      documents: [],
    })

    expect(progress.firstIncomplete).toBe("details")
    expect(progress.completed.details).toBe(false)
  })

  it("resumes at identity after details", () => {
    const progress = onboardingProgress({
      restaurant: RESTAURANT,
      kyc: EMPTY_KYC,
      documents: [],
    })

    expect(progress.firstIncomplete).toBe("identity")
    expect(progress.completed.details).toBe(true)
  })

  it("does not count pending documents", () => {
    const documents = DOCUMENT_TYPES.map((type) =>
      doc(type, type === "pan_back" ? "pending" : "uploaded")
    )

    const progress = onboardingProgress({
      restaurant: RESTAURANT,
      kyc: { ...EMPTY_KYC, ...IDENTITY_KYC, ...BANK_KYC },
      documents,
    })

    expect(progress.completed.identity).toBe(false)
    expect(progress.missing).toEqual(["PAN · back"])
  })

  it("resumes at bank once identity is complete", () => {
    const progress = onboardingProgress({
      restaurant: RESTAURANT,
      kyc: { ...EMPTY_KYC, ...IDENTITY_KYC },
      documents: ALL_DOCS.filter((d) => d.type !== "bank_proof"),
    })

    expect(progress.completed.identity).toBe(true)
    expect(progress.firstIncomplete).toBe("bank")
  })

  it("lands on review when everything is present", () => {
    const progress = onboardingProgress({
      restaurant: RESTAURANT,
      kyc: { ...EMPTY_KYC, ...IDENTITY_KYC, ...BANK_KYC },
      documents: ALL_DOCS,
    })

    expect(progress.firstIncomplete).toBe("review")
    expect(progress.missing).toEqual([])
  })

  it("lists missing documents before missing KYC fields", () => {
    const progress = onboardingProgress({
      restaurant: RESTAURANT,
      kyc: EMPTY_KYC,
      documents: [],
    })

    expect(progress.missing[0]).toBe("Aadhaar · front")
    expect(progress.missing).toContain("IFSC code")
  })
})

describe("clampStep", () => {
  it("defaults to the first incomplete step", () => {
    expect(clampStep(undefined, "identity")).toBe("identity")
  })

  it("allows going back", () => {
    expect(clampStep("details", "bank")).toBe("details")
  })

  it("does not allow skipping ahead", () => {
    expect(clampStep("review", "identity")).toBe("identity")
  })
})

describe("documentFileFor", () => {
  it("returns the uploaded file", () => {
    expect(documentFileFor([doc("pan_front")], "pan_front")).toEqual({
      contentType: "image/png",
      size: 1,
      url: "https://s3.test/x",
    })
  })

  it("ignores pending and absent documents", () => {
    expect(
      documentFileFor([doc("pan_front", "pending")], "pan_front")
    ).toBeNull()
    expect(documentFileFor([], "pan_front")).toBeNull()
  })
})
