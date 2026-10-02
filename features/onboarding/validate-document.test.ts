import { describe, expect, it } from "vitest"

import { validateDocumentFile } from "./validate-document"

function file(type: string, size: number): File {
  return new File([new Uint8Array(size)], "doc", { type })
}

describe("validateDocumentFile", () => {
  it.each(["application/pdf", "image/jpeg", "image/png"])(
    "accepts %s",
    (type) => {
      expect(validateDocumentFile(file(type, 10))).toBeNull()
    }
  )

  it("rejects other types", () => {
    expect(validateDocumentFile(file("image/webp", 10))).toMatch(/PDF, JPG/)
  })

  it("rejects an empty file", () => {
    expect(validateDocumentFile(file("image/png", 0))).toMatch(/empty/)
  })

  it("rejects files over 5 MB", () => {
    expect(
      validateDocumentFile(file("image/png", 5 * 1024 * 1024 + 1))
    ).toMatch(/Max 5 MB/)
  })

  it("accepts exactly 5 MB", () => {
    expect(
      validateDocumentFile(file("application/pdf", 5 * 1024 * 1024))
    ).toBeNull()
  })
})
