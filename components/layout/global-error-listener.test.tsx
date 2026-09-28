import { render } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { notifyError } from "@/lib/toast"

import { GlobalErrorListener } from "./global-error-listener"

vi.mock("@/lib/toast", () => ({
  notifyError: vi.fn(),
}))

describe("GlobalErrorListener", () => {
  it("toasts when a global error event fires", () => {
    render(<GlobalErrorListener />)

    window.dispatchEvent(
      new ErrorEvent("error", { message: "Unexpected token" })
    )

    expect(notifyError).toHaveBeenCalledWith("Unexpected token")
  })

  it("toasts when a promise rejection is unhandled", () => {
    render(<GlobalErrorListener />)

    const event = new Event("unhandledrejection") as PromiseRejectionEvent
    Object.defineProperty(event, "reason", {
      value: new Error("network down"),
    })
    window.dispatchEvent(event)

    expect(notifyError).toHaveBeenCalledWith("network down")
  })

  it("renders nothing", () => {
    const { container } = render(<GlobalErrorListener />)
    expect(container).toBeEmptyDOMElement()
  })
})
