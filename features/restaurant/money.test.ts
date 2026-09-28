import { describe, expect, it } from "vitest"

import { formatPaise, rupeesToPaise } from "./money"

describe("rupeesToPaise", () => {
  it("converts whole rupees", () => {
    expect(rupeesToPaise("249")).toBe(24900)
  })

  it("converts rupees with two decimals", () => {
    expect(rupeesToPaise("249.50")).toBe(24950)
  })

  it("pads a single decimal", () => {
    expect(rupeesToPaise("249.5")).toBe(24950)
  })

  it("accepts zero", () => {
    expect(rupeesToPaise("0")).toBe(0)
  })

  it("throws on more than two decimals", () => {
    expect(() => rupeesToPaise("249.505")).toThrow()
  })

  it("throws on a negative amount", () => {
    expect(() => rupeesToPaise("-5")).toThrow()
  })

  it("throws on non-numeric input", () => {
    expect(() => rupeesToPaise("abc")).toThrow()
  })
})

describe("formatPaise", () => {
  it("formats paise as rupees with the ₹ symbol", () => {
    expect(formatPaise(24950)).toBe("₹249.50")
  })

  it("formats zero", () => {
    expect(formatPaise(0)).toBe("₹0.00")
  })
})
