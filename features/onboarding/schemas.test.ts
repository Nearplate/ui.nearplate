import { describe, expect, it } from "vitest"

import { EMPTY_KYC } from "./schemas"
import { bankFormSchema, identityFormSchema, missingKycFields } from "./schemas"

describe("identityFormSchema", () => {
  it("uppercases and accepts a valid PAN", () => {
    const parsed = identityFormSchema.parse({ panNumber: "abcde1234f" })

    expect(parsed.panNumber).toBe("ABCDE1234F")
  })

  it("rejects a malformed PAN", () => {
    expect(identityFormSchema.safeParse({ panNumber: "ABC123" }).success).toBe(
      false
    )
  })

  it("rejects a 13-digit FSSAI number", () => {
    expect(
      identityFormSchema.safeParse({ fssaiNumber: "1234567890123" }).success
    ).toBe(false)
  })

  it("treats blank fields as unchanged", () => {
    const parsed = identityFormSchema.parse({ panNumber: "", fssaiNumber: " " })

    expect(parsed).toEqual({ panNumber: undefined, fssaiNumber: undefined })
  })
})

describe("bankFormSchema", () => {
  const valid = {
    accountHolderName: "Tasty Bites",
    accountNumber: "123456789012",
    confirmAccountNumber: "123456789012",
    ifscCode: "hdfc0001234",
    bankName: "HDFC",
  }

  it("accepts valid details and uppercases the IFSC", () => {
    expect(bankFormSchema.parse(valid).ifscCode).toBe("HDFC0001234")
  })

  it("rejects mismatched account numbers", () => {
    const result = bankFormSchema.safeParse({
      ...valid,
      confirmAccountNumber: "999999999999",
    })

    expect(result.success).toBe(false)
  })

  it("rejects a bad IFSC", () => {
    expect(
      bankFormSchema.safeParse({ ...valid, ifscCode: "HDFC1001234" }).success
    ).toBe(false)
  })

  it("rejects a too-short account number", () => {
    expect(
      bankFormSchema.safeParse({
        ...valid,
        accountNumber: "1234",
        confirmAccountNumber: "1234",
      }).success
    ).toBe(false)
  })
})

describe("missingKycFields", () => {
  it("requires fields that are neither saved nor provided", () => {
    const saved = { ...EMPTY_KYC, panNumber: "XXXXX1234F" }

    const missing = missingKycFields(saved, { fssaiNumber: undefined }, [
      "panNumber",
      "fssaiNumber",
    ])

    expect(missing).toEqual(["fssaiNumber"])
  })
})
