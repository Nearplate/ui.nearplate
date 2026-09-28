import { describe, expect, it, vi } from "vitest"

import { toastManager } from "@/components/ui/toast"

import { notifyError } from "./toast"

vi.mock("@/components/ui/toast", () => ({
  toastManager: { add: vi.fn() },
}))

describe("notifyError", () => {
  it("pushes an error toast with the given message", () => {
    notifyError("The server is unreachable.")

    expect(toastManager.add).toHaveBeenCalledWith({
      type: "error",
      title: "Something went wrong",
      description: "The server is unreachable.",
    })
  })

  it("falls back to a generic message and title", () => {
    notifyError()

    expect(toastManager.add).toHaveBeenCalledWith({
      type: "error",
      title: "Something went wrong",
      description: "Please try again.",
    })
  })

  it("accepts a custom title", () => {
    notifyError("Details.", "Request failed")

    expect(toastManager.add).toHaveBeenCalledWith({
      type: "error",
      title: "Request failed",
      description: "Details.",
    })
  })
})
