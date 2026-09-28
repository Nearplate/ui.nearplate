import { describe, expect, it } from "vitest"

import type { AddressComponentLike } from "./google-address"
import { toAddress } from "./google-address"

function component(longText: string, ...types: string[]): AddressComponentLike {
  return { longText, types }
}

describe("toAddress", () => {
  it("maps a full Bangalore-style set of components", () => {
    const components = [
      component("42", "premise"),
      component("6th Cross", "route"),
      component("Kaggadasapura", "sublocality_level_1"),
      component("Bengaluru", "locality"),
      component("Karnataka", "administrative_area_level_1"),
      component("560093", "postal_code"),
      component("India", "country"),
    ]

    expect(toAddress(components)).toEqual({
      line1: "42, 6th Cross, Kaggadasapura",
      city: "Bengaluru",
      state: "Karnataka",
      zipcode: "560093",
    })
  })

  it("omits zipcode when the postal code is missing", () => {
    const components = [
      component("6th Cross", "route"),
      component("Bengaluru", "locality"),
      component("Karnataka", "administrative_area_level_1"),
    ]

    const result = toAddress(components)

    expect(result.zipcode).toBeUndefined()
    expect(result.city).toBe("Bengaluru")
  })

  it("falls back to administrative_area_level_3 then level_2 for city", () => {
    const withLevel3 = toAddress([
      component("Some Taluk", "administrative_area_level_3"),
      component("Some District", "administrative_area_level_2"),
    ])
    expect(withLevel3.city).toBe("Some Taluk")

    const withLevel2 = toAddress([
      component("Some District", "administrative_area_level_2"),
    ])
    expect(withLevel2.city).toBe("Some District")
  })

  it("prefers sublocality_level_2 over sublocality_level_1", () => {
    const result = toAddress([
      component("Inner Area", "sublocality_level_2"),
      component("Outer Area", "sublocality_level_1"),
    ])

    expect(result.line1).toBe("Inner Area")
  })

  it("returns an empty object for unrelated components", () => {
    expect(toAddress([component("India", "country")])).toEqual({})
  })
})
