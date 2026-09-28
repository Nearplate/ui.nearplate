import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import type { User } from "@/features/auth/schemas"

import { ProfileForm } from "./profile-form"

vi.mock("../actions", () => ({
  updateAccountProfileAction: vi.fn(async () => ({ status: "success" })),
}))

const USER: User = {
  id: "u1",
  email: "ada@example.com",
  role: "user",
  firstName: "Ada",
  lastName: "Lovelace",
  isOnboarded: true,
  avatarUrl: null,
  phoneNumber: null,
  dateOfBirth: null,
  anniversaryDate: null,
  gender: null,
  createdAt: "2026-01-01T00:00:00.000Z",
}

describe("ProfileForm", () => {
  it("renders the caller's current details", () => {
    render(<ProfileForm user={USER} />)

    expect(screen.getByLabelText("First name")).toHaveValue("Ada")
    expect(screen.getByLabelText("Last name")).toHaveValue("Lovelace")
    expect(screen.getByLabelText("Email")).toHaveValue("ada@example.com")
    expect(screen.getByLabelText("Email")).toBeDisabled()
  })

  it("saves an update", async () => {
    const user = userEvent.setup()
    render(<ProfileForm user={USER} />)

    await user.type(screen.getByLabelText("Mobile"), "9876543210")
    await user.click(screen.getByRole("button", { name: /save changes/i }))

    expect(await screen.findByText("Profile updated.")).toBeInTheDocument()
  })
})
