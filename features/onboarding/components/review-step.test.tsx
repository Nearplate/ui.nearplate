import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import type { OwnerRestaurant } from "@/features/restaurant/schemas"

import { EMPTY_KYC } from "../schemas"
import { ReviewStep } from "./review-step"

vi.mock("../actions")

const RESTAURANT = {
  id: "r1",
  name: "Tasty Bites",
  cuisines: ["indian"],
  isPureVeg: true,
  address: {
    line1: "1 MG Road",
    line2: null,
    city: "Bengaluru",
    state: "KA",
    zipcode: "560001",
    phoneNumber: "9876543210",
  },
} as OwnerRestaurant

describe("ReviewStep", () => {
  it("disables Submit and lists what is missing", () => {
    render(
      <ReviewStep
        restaurant={RESTAURANT}
        kyc={EMPTY_KYC}
        documents={[]}
        missing={["Aadhaar · front", "IFSC code"]}
      />
    )

    expect(
      screen.getByRole("button", { name: /submit for review/i })
    ).toBeDisabled()
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Aadhaar · front, IFSC code"
    )
  })

  it("enables Submit when nothing is missing", () => {
    render(
      <ReviewStep
        restaurant={RESTAURANT}
        kyc={EMPTY_KYC}
        documents={[]}
        missing={[]}
      />
    )

    expect(
      screen.getByRole("button", { name: /submit for review/i })
    ).toBeEnabled()
  })

  it("links each section to its step and shows masked values", () => {
    render(
      <ReviewStep
        restaurant={RESTAURANT}
        kyc={{ ...EMPTY_KYC, accountNumber: "XXXXXXXXXXXX3456" }}
        documents={[]}
        missing={[]}
      />
    )

    expect(
      screen.getByRole("link", { name: /edit identity/i })
    ).toHaveAttribute("href", "/restaurant/onboarding?step=identity")
    expect(screen.getByText("XXXXXXXXXXXX3456")).toBeInTheDocument()
  })
})
