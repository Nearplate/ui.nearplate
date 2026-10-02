import { describe, expect, it } from "vitest"

import { errorMessage } from "./error-message"
import { ApiError } from "./client"

describe("errorMessage", () => {
  it.each([
    [400, "Check your details and try again."],
    [401, "Sign-in failed. The link may have expired; request a new one."],
    [404, "Not found. It may have been removed."],
    [429, "Too many attempts. Try again in an hour."],
    [501, "This sign-in method isn't available right now."],
    [503, "Something went wrong. Please try again."],
  ])("maps status %s to a friendly message", (status, message) => {
    expect(errorMessage(new ApiError(status))).toBe(message)
  })

  it.each([
    [
      "RESTAURANT_ONBOARDING_LOCKED",
      "Your details are under review and can't be changed.",
    ],
    ["RESTAURANT_INCOMPLETE", "Some details are still missing."],
    [
      "RESTAURANT_DOCUMENT_UPLOAD_MISMATCH",
      "Upload didn't complete. Try again.",
    ],
  ])("prefers the message for catalogue code %s", (code, message) => {
    expect(errorMessage(new ApiError(409, code))).toBe(message)
  })

  it("falls back to a generic message for an unknown 409", () => {
    expect(errorMessage(new ApiError(409))).toMatch(/conflicts/)
  })

  it("rethrows a non-ApiError", () => {
    const error = new Error("boom")
    expect(() => errorMessage(error)).toThrow(error)
  })
})
