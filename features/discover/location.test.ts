import { describe, expect, it } from "vitest"

import {
  parseFeedFilters,
  parseLocationCookie,
  resolveFeedLocation,
} from "./location"

const DELHI = { lng: 77.2, lat: 28.6, label: "Connaught Place" }

describe("parseLocationCookie", () => {
  it("returns the location from valid JSON", () => {
    expect(parseLocationCookie(JSON.stringify(DELHI))).toEqual(DELHI)
  })

  it("returns null when the cookie is missing", () => {
    expect(parseLocationCookie(undefined)).toBeNull()
  })

  it("returns null for malformed JSON", () => {
    expect(parseLocationCookie("{nope")).toBeNull()
  })

  it("returns null for out-of-range coordinates", () => {
    expect(
      parseLocationCookie(JSON.stringify({ ...DELHI, lat: 123 }))
    ).toBeNull()
  })

  it("returns null when the label is blank", () => {
    expect(
      parseLocationCookie(JSON.stringify({ ...DELHI, label: "  " }))
    ).toBeNull()
  })
})

describe("resolveFeedLocation", () => {
  const address = { lat: 19.07, lng: 72.87, city: "Mumbai", line1: "Bandra" }

  it("prefers the cookie over the default address", () => {
    expect(resolveFeedLocation(DELHI, address)).toEqual(DELHI)
  })

  it("falls back to the default address when there is no cookie", () => {
    expect(resolveFeedLocation(null, address)).toEqual({
      lng: 72.87,
      lat: 19.07,
      label: "Bandra, Mumbai",
    })
  })

  it("ignores an address without a map pin", () => {
    expect(
      resolveFeedLocation(null, { ...address, lat: null, lng: null })
    ).toBeNull()
  })

  it("returns null when nothing is known", () => {
    expect(resolveFeedLocation(null, null)).toBeNull()
  })
})

describe("parseFeedFilters", () => {
  it("defaults to no filters", () => {
    expect(parseFeedFilters({})).toEqual({ cuisine: undefined, veg: false })
  })

  it("lowercases and trims the cuisine", () => {
    expect(parseFeedFilters({ cuisine: "  Biryani " }).cuisine).toBe("biryani")
  })

  it("reads veg=1 as a pure veg filter", () => {
    expect(parseFeedFilters({ veg: "1" }).veg).toBe(true)
  })

  it("ignores repeated params and takes the first value", () => {
    expect(parseFeedFilters({ cuisine: ["pizza", "thai"] }).cuisine).toBe(
      "pizza"
    )
  })

  it("drops an over-long cuisine", () => {
    expect(
      parseFeedFilters({ cuisine: "x".repeat(41) }).cuisine
    ).toBeUndefined()
  })
})
