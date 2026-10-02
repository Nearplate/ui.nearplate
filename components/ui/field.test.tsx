import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Field } from "./field"

describe("Field", () => {
  it("renders the label for the control", () => {
    render(
      <Field label="PAN" htmlFor="pan">
        <input id="pan" />
      </Field>
    )

    expect(screen.getByLabelText("PAN")).toBeInTheDocument()
  })

  it("renders a hint with a stable id", () => {
    render(
      <Field label="PAN" htmlFor="pan" hint="10 characters">
        <input id="pan" />
      </Field>
    )

    expect(screen.getByText("10 characters")).toHaveAttribute("id", "pan-hint")
  })

  it("renders an error as an alert with a stable id", () => {
    render(
      <Field label="PAN" htmlFor="pan" error="Invalid PAN">
        <input id="pan" />
      </Field>
    )

    expect(screen.getByRole("alert")).toHaveTextContent("Invalid PAN")
    expect(screen.getByRole("alert")).toHaveAttribute("id", "pan-error")
  })
})
