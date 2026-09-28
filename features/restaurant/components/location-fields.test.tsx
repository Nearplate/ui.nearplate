import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { LocationFields } from "./location-fields"

vi.mock("./location-picker", () => ({
  LocationPicker: ({
    onAddressResolved,
  }: {
    onAddressResolved: (address: {
      line1?: string
      city?: string
      state?: string
      zipcode?: string
    }) => void
  }) => (
    <button
      type="button"
      onClick={() =>
        onAddressResolved({
          line1: "42, 6th Cross",
          city: "Bengaluru",
          state: "Karnataka",
          zipcode: "560093",
        })
      }
    >
      Resolve address
    </button>
  ),
}))

describe("LocationFields", () => {
  it("fills the address fields from a resolved location without touching line2 or phone", async () => {
    const user = userEvent.setup()
    render(
      <LocationFields initialLat={null} initialLng={null} required={false} />
    )

    await user.type(
      screen.getByLabelText("Address line 2 (optional)"),
      "Flat 3"
    )
    await user.type(screen.getByLabelText("Phone"), "9876543210")
    await user.click(screen.getByRole("button", { name: "Resolve address" }))

    expect(screen.getByLabelText("Address line 1")).toHaveValue("42, 6th Cross")
    expect(screen.getByLabelText("City")).toHaveValue("Bengaluru")
    expect(screen.getByLabelText("State")).toHaveValue("Karnataka")
    expect(screen.getByLabelText("Zip code")).toHaveValue("560093")
    expect(screen.getByLabelText("Address line 2 (optional)")).toHaveValue(
      "Flat 3"
    )
    expect(screen.getByLabelText("Phone")).toHaveValue("9876543210")
  })
})
