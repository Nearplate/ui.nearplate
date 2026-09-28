import { describe, expect, it } from "vitest"

import {
  addressFormSchema,
  ORDERS_PAGE_SIZE,
  pageCount,
  pageOffset,
  profileFormSchema,
} from "./schemas"

describe("profileFormSchema", () => {
  it("drops a blank name so it is left unchanged", () => {
    const parsed = profileFormSchema.parse({
      firstName: "",
      lastName: "",
      phoneNumber: "",
      dateOfBirth: "",
      anniversaryDate: "",
      gender: "",
    })

    expect(parsed.firstName).toBeUndefined()
    expect(parsed.lastName).toBeUndefined()
  })

  it("turns a blank optional field into null so it clears on the API", () => {
    const parsed = profileFormSchema.parse({
      phoneNumber: "",
      dateOfBirth: "",
      anniversaryDate: "",
      gender: "",
    })

    expect(parsed.phoneNumber).toBeNull()
    expect(parsed.dateOfBirth).toBeNull()
    expect(parsed.anniversaryDate).toBeNull()
    expect(parsed.gender).toBeNull()
  })

  it("rejects a phone number in the wrong shape", () => {
    const result = profileFormSchema.safeParse({ phoneNumber: "not-a-phone" })
    expect(result.success).toBe(false)
  })

  it("accepts a valid phone number", () => {
    const parsed = profileFormSchema.parse({
      phoneNumber: "+919876543210",
      dateOfBirth: null,
      anniversaryDate: null,
      gender: null,
    })
    expect(parsed.phoneNumber).toBe("+919876543210")
  })

  it("rejects a date of birth in the future", () => {
    const future = new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10)
    const result = profileFormSchema.safeParse({ dateOfBirth: future })
    expect(result.success).toBe(false)
  })

  it("rejects a malformed date", () => {
    const result = profileFormSchema.safeParse({ dateOfBirth: "01-01-2000" })
    expect(result.success).toBe(false)
  })

  it("accepts a valid past date", () => {
    const parsed = profileFormSchema.parse({
      dateOfBirth: "2000-01-01",
      phoneNumber: null,
      anniversaryDate: null,
      gender: null,
    })
    expect(parsed.dateOfBirth).toBe("2000-01-01")
  })

  it("rejects an unknown gender", () => {
    const result = profileFormSchema.safeParse({ gender: "unknown" })
    expect(result.success).toBe(false)
  })
})

describe("addressFormSchema", () => {
  const BASE = {
    label: "Home",
    line1: "221B Baker Street",
    line2: null,
    city: "Mumbai",
    state: "MH",
    zipcode: "400001",
    phoneNumber: null,
    isDefault: false,
  }

  it("accepts a minimal valid address", () => {
    const result = addressFormSchema.safeParse(BASE)
    expect(result.success).toBe(true)
  })

  it("rejects an empty label", () => {
    const result = addressFormSchema.safeParse({ ...BASE, label: "" })
    expect(result.success).toBe(false)
  })

  it("turns a blank optional line2 into null", () => {
    const parsed = addressFormSchema.parse({ ...BASE, line2: "" })
    expect(parsed.line2).toBeNull()
  })
})

describe("pageCount", () => {
  it("returns at least one page for zero results", () => {
    expect(pageCount(0)).toBe(1)
  })

  it("rounds up to a full page", () => {
    expect(pageCount(ORDERS_PAGE_SIZE + 1)).toBe(2)
  })

  it("fits exactly on one page", () => {
    expect(pageCount(ORDERS_PAGE_SIZE)).toBe(1)
  })
})

describe("pageOffset", () => {
  it("is zero on the first page", () => {
    expect(pageOffset(1)).toBe(0)
  })

  it("advances by the page size", () => {
    expect(pageOffset(2)).toBe(ORDERS_PAGE_SIZE)
  })
})
