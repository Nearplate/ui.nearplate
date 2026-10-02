import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { EMPTY_KYC } from "../schemas"
import { BankStep } from "./bank-step"
import { IdentityStep } from "./identity-step"

vi.mock("../actions")

describe("IdentityStep", () => {
  it("requires the PAN number until one is saved", () => {
    render(<IdentityStep restaurantId="r1" kyc={EMPTY_KYC} documents={[]} />)

    expect(screen.getByLabelText("PAN number")).toBeRequired()
  })

  it("shows the saved masked PAN as a hint and makes the field optional", () => {
    render(
      <IdentityStep
        restaurantId="r1"
        kyc={{ ...EMPTY_KYC, panNumber: "XXXXX1234F" }}
        documents={[]}
      />
    )

    expect(screen.getByLabelText("PAN number")).not.toBeRequired()
    expect(screen.getByText(/Saved as XXXXX1234F/)).toBeInTheDocument()
  })

  it("renders an uploader for each of the five identity documents", () => {
    render(<IdentityStep restaurantId="r1" kyc={EMPTY_KYC} documents={[]} />)

    for (const label of [
      "Aadhaar · front",
      "Aadhaar · back",
      "PAN · front",
      "PAN · back",
      "FSSAI certificate",
    ]) {
      expect(
        screen.getByLabelText(`Choose file for ${label}`)
      ).toBeInTheDocument()
    }
  })
})

describe("BankStep", () => {
  it("never prefills the masked account number", () => {
    render(
      <BankStep
        restaurantId="r1"
        kyc={{ ...EMPTY_KYC, accountNumber: "XXXXXXXXXXXX3456" }}
        documents={[]}
      />
    )

    expect(screen.getByLabelText("Account number")).toHaveValue("")
    expect(screen.getByText(/Saved as XXXXXXXXXXXX3456/)).toBeInTheDocument()
  })

  it("prefills the unmasked fields", () => {
    render(
      <BankStep
        restaurantId="r1"
        kyc={{ ...EMPTY_KYC, ifscCode: "HDFC0001234", bankName: "HDFC" }}
        documents={[]}
      />
    )

    expect(screen.getByLabelText("IFSC code")).toHaveValue("HDFC0001234")
    expect(screen.getByLabelText("Bank name")).toHaveValue("HDFC")
  })

  it("offers the bank proof uploader and a Back link", () => {
    render(<BankStep restaurantId="r1" kyc={EMPTY_KYC} documents={[]} />)

    expect(
      screen.getByLabelText("Choose file for Bank proof")
    ).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Back" })).toHaveAttribute(
      "href",
      "/restaurant/onboarding?step=identity"
    )
  })
})
