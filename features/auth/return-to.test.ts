import { describe, expect, it } from "vitest"

import { safeReturnPath } from "./return-to"

describe("safeReturnPath", () => {
  it.each([
    "/cart",
    "/account",
    "/checkout/7b1c2f0e-8a4d-4c55-9f0a-1234567890ab",
    "/r/eat-n-crave",
  ])("accepts %s", (path) => {
    expect(safeReturnPath(path)).toBe(path)
  })

  it.each([
    "//evil.example.com",
    "/\\evil.example.com",
    "https://evil.example.com/cart",
    "/cart?next=https://evil.example.com",
    "/cart/../auth",
    "/restaurant",
    "/checkout/",
    "/r/",
    "cart",
    "",
  ])("rejects %j", (path) => {
    expect(safeReturnPath(path)).toBeNull()
  })

  it("rejects missing values", () => {
    expect(safeReturnPath(undefined)).toBeNull()
    expect(safeReturnPath(null)).toBeNull()
  })
})
