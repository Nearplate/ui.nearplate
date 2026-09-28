import { describe, expect, it } from "vitest"

import { parseCuisines } from "./cuisines"

describe("parseCuisines", () => {
  it("splits on commas, trims and lowercases", () => {
    expect(parseCuisines("Indian, Chinese ,  Thai")).toEqual([
      "indian",
      "chinese",
      "thai",
    ])
  })

  it("drops empty entries and de-duplicates", () => {
    expect(parseCuisines("Indian,, indian ,Thai")).toEqual(["indian", "thai"])
  })

  it("caps at 10 entries", () => {
    const input = Array.from({ length: 15 }, (_, i) => `c${i}`).join(",")
    expect(parseCuisines(input)).toHaveLength(10)
  })

  it("returns an empty array for blank input", () => {
    expect(parseCuisines("   ")).toEqual([])
  })
})
