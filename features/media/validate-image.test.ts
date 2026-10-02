import { describe, expect, test } from "vitest"

import { validateImageFile } from "./validate-image"

function file(type: string, size: number) {
  return { type, size } as File
}

describe("validateImageFile", () => {
  test("accepts an allowed type within the size limit", () => {
    expect(validateImageFile("logo", file("image/png", 1024))).toBeNull()
  })

  test("rejects a disallowed content type", () => {
    expect(validateImageFile("logo", file("image/gif", 1024))).toMatch(
      /JPG, PNG or WebP/
    )
  })

  test("rejects an empty file", () => {
    expect(validateImageFile("banner", file("image/png", 0))).toMatch(/empty/i)
  })

  test("rejects a file over the per-kind limit", () => {
    const threeMb = 3 * 1024 * 1024
    expect(validateImageFile("logo", file("image/png", threeMb))).toMatch(
      /2 MB/
    )
    expect(validateImageFile("banner", file("image/png", threeMb))).toBeNull()
  })
})
