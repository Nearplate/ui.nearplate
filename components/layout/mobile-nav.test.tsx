import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { MobileNav } from "./mobile-nav"

vi.mock("next/navigation", () => ({ usePathname: () => "/" }))

describe("MobileNav", () => {
  it("opens and closes the menu panel", async () => {
    render(<MobileNav account={{ href: "/auth", label: "Log in" }} />)
    const toggle = screen.getByRole("button", { name: "Open menu" })
    expect(screen.queryByRole("link", { name: /log in/i })).toBeNull()

    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByRole("link", { name: /log in/i })).toHaveAttribute(
      "href",
      "/auth"
    )

    await userEvent.keyboard("{Escape}")
    expect(screen.getByRole("button", { name: "Open menu" })).toHaveAttribute(
      "aria-expanded",
      "false"
    )
  })
})
