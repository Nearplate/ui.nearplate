import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Stepper } from "./stepper"

const STEPS = [
  { id: "details", label: "Details", href: "?step=details" },
  { id: "identity", label: "Identity", href: "?step=identity" },
  { id: "bank", label: "Bank", href: "?step=bank" },
]

describe("Stepper", () => {
  it("marks the current step", () => {
    render(<Stepper steps={STEPS} current="identity" completed={["details"]} />)

    expect(screen.getByRole("listitem", { current: "step" })).toHaveTextContent(
      "Identity"
    )
  })

  it("links completed and current steps, not upcoming ones", () => {
    render(<Stepper steps={STEPS} current="identity" completed={["details"]} />)

    expect(screen.getByRole("link", { name: /Details/ })).toHaveAttribute(
      "href",
      "?step=details"
    )
    expect(screen.getByRole("link", { name: /Identity/ })).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: /Bank/ })).not.toBeInTheDocument()
  })

  it("shows a compact step counter for small screens", () => {
    render(<Stepper steps={STEPS} current="identity" completed={["details"]} />)

    expect(screen.getByText("Step 2 of 3 · Identity")).toBeInTheDocument()
  })
})
