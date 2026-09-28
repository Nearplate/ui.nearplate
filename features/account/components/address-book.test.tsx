import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import type { AccountAddress } from "../schemas"
import { AddressBook } from "./address-book"

vi.mock("../actions", () => ({
  saveAddressAction: vi.fn(async () => ({ status: "idle" })),
  deleteAddressAction: vi.fn(),
  setDefaultAddressAction: vi.fn(),
}))

const ADDRESS: AccountAddress = {
  id: "addr-1",
  label: "Home",
  isDefault: true,
  line1: "221B Baker Street",
  line2: null,
  city: "Mumbai",
  state: "MH",
  zipcode: "400001",
  phoneNumber: null,
  lat: null,
  lng: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
}

describe("AddressBook", () => {
  it("shows an empty state with no addresses", () => {
    render(<AddressBook addresses={[]} />)
    expect(screen.getByText("No addresses saved yet.")).toBeInTheDocument()
  })

  it("lists a saved address", () => {
    render(<AddressBook addresses={[ADDRESS]} />)
    expect(screen.getByText("Home")).toBeInTheDocument()
    expect(screen.getByText("Default")).toBeInTheDocument()
    expect(screen.getByText(/221B Baker Street/)).toBeInTheDocument()
  })

  it("opens the add-address dialog with the Home placeholder", async () => {
    const user = userEvent.setup()
    render(<AddressBook addresses={[]} />)

    await user.click(screen.getByRole("button", { name: /add address/i }))

    expect(screen.getByPlaceholderText("Home")).toBeInTheDocument()
  })

  it("requires a phone number shown with a fixed +91 prefix", async () => {
    const user = userEvent.setup()
    render(<AddressBook addresses={[]} />)

    await user.click(screen.getByRole("button", { name: /add address/i }))

    const phone = screen.getByLabelText("Phone")
    expect(phone).toBeRequired()
    expect(phone).toHaveAttribute("maxLength", "10")
    expect(screen.getByText("+91")).toBeInTheDocument()
  })

  it("prefills the phone without the +91 prefix when editing", async () => {
    const user = userEvent.setup()
    render(
      <AddressBook addresses={[{ ...ADDRESS, phoneNumber: "+919876543210" }]} />
    )

    screen.getByRole("button", { name: "Address actions" }).focus()
    await user.keyboard("{Enter}")
    await user.click(await screen.findByRole("menuitem", { name: "Edit" }))

    expect(screen.getByLabelText("Phone")).toHaveValue("9876543210")
  })
})
