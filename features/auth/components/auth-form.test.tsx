import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { requestMagicLinkAction } from "../actions"
import { AuthForm } from "./auth-form"

vi.mock("../actions", () => ({
  requestMagicLinkAction: vi.fn(),
  continueAsGuestAction: vi.fn(),
  startGoogleAction: vi.fn(),
}))

describe("AuthForm", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders the email field and guest option", () => {
    render(<AuthForm initialRole="user" />)

    expect(screen.getByLabelText("Email")).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /continue with email/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /browse as guest/i })
    ).toBeInTheDocument()
  })

  it("renders the Google button with the current role in a hidden field", () => {
    const { container } = render(<AuthForm initialRole="restaurant" />)

    expect(
      screen.getByRole("button", { name: /continue with google/i })
    ).toBeInTheDocument()
    const roleInput = container.querySelector(
      'input[name="role"][type="hidden"]'
    )
    expect(roleInput).toHaveValue("restaurant")
  })

  it("preselects the role from the initial prop and lets the user switch", async () => {
    const user = userEvent.setup()
    render(<AuthForm initialRole="restaurant" />)

    const restaurant = screen.getByLabelText("I own a restaurant")
    const customer = screen.getByLabelText("I'm hungry")
    expect(restaurant).toBeChecked()

    await user.click(customer)

    expect(customer).toBeChecked()
    expect(restaurant).not.toBeChecked()
  })

  it("shows the inbox confirmation after the link is sent", async () => {
    vi.mocked(requestMagicLinkAction).mockResolvedValue({
      status: "sent",
      email: "asha@example.com",
    })
    const user = userEvent.setup()
    render(<AuthForm initialRole="user" />)

    await user.type(screen.getByLabelText("Email"), "asha@example.com")
    await user.click(
      screen.getByRole("button", { name: /continue with email/i })
    )

    expect(await screen.findByText(/check your inbox/i)).toBeInTheDocument()
    expect(screen.getByText(/asha@example.com/)).toBeInTheDocument()
  })

  it("shows a role mismatch message", async () => {
    vi.mocked(requestMagicLinkAction).mockResolvedValue({
      status: "role_mismatch",
      role: "restaurant",
    })
    const user = userEvent.setup()
    render(<AuthForm initialRole="user" />)

    await user.type(screen.getByLabelText("Email"), "owner@example.com")
    await user.click(
      screen.getByRole("button", { name: /continue with email/i })
    )

    expect(
      await screen.findByText(/already registered as a restaurant/i)
    ).toBeInTheDocument()
  })

  it("shows the notice passed from the page", () => {
    render(
      <AuthForm initialRole="user" notice="Guest access is unavailable." />
    )

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Guest access is unavailable."
    )
  })
})
