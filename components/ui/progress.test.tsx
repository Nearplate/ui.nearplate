import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Progress } from "./progress"

describe("Progress", () => {
  it("exposes the value to assistive tech", () => {
    render(<Progress value={40} label="Uploading" />)

    const bar = screen.getByRole("progressbar", { name: "Uploading" })
    expect(bar).toHaveAttribute("aria-valuenow", "40")
    expect(bar).toHaveAttribute("aria-valuemin", "0")
    expect(bar).toHaveAttribute("aria-valuemax", "100")
  })

  it("clamps out-of-range values", () => {
    render(<Progress value={180} label="Uploading" />)

    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "100"
    )
  })
})
