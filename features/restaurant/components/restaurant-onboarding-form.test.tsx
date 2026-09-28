import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { RestaurantOnboardingForm } from "./restaurant-onboarding-form"

vi.mock("../actions", () => ({
  createRestaurantAction: vi.fn(),
}))

vi.mock("./location-picker", () => ({
  LocationPicker: () => null,
}))

describe("RestaurantOnboardingForm", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("advances from the restaurant step to the location step on Next", async () => {
    const user = userEvent.setup()
    render(<RestaurantOnboardingForm needsName={false} />)

    expect(screen.getByLabelText("Address line 1")).not.toBeVisible()

    await user.type(screen.getByLabelText("Name"), "Eat n Crave")
    await user.type(
      screen.getByLabelText("Cuisines (comma-separated)"),
      "Indian, Chinese"
    )
    await user.click(screen.getByRole("button", { name: /next/i }))

    expect(screen.getByLabelText("Address line 1")).toBeVisible()
  })
})
