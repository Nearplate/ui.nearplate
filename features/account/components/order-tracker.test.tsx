import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { OrderTracker, trackerSteps } from "./order-tracker"

describe("trackerSteps", () => {
  it("marks earlier steps done and the current one active", () => {
    expect(
      trackerSteps("preparing").map((step) => [step.status, step.state])
    ).toEqual([
      ["placed", "done"],
      ["accepted", "done"],
      ["preparing", "current"],
      ["out_for_delivery", "upcoming"],
      ["delivered", "upcoming"],
    ])
  })

  it("marks every step done once delivered", () => {
    expect(trackerSteps("delivered").every((s) => s.state === "done")).toBe(
      true
    )
  })
})

describe("OrderTracker", () => {
  it("names the current step for screen readers", () => {
    render(<OrderTracker status="accepted" />)
    expect(screen.getByText("Accepted").closest("li")).toHaveAttribute(
      "aria-current",
      "step"
    )
  })

  it("shows a cancelled notice instead of the steps", () => {
    render(<OrderTracker status="cancelled" />)
    expect(screen.getByText(/this order was cancelled/i)).toBeInTheDocument()
    expect(screen.queryByRole("list")).not.toBeInTheDocument()
  })
})
