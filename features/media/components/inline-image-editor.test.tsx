import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { InlineImageEditor } from "./inline-image-editor"

vi.mock("../actions")

describe("InlineImageEditor", () => {
  it("offers a logo edit control labelled for the current state", () => {
    render(
      <InlineImageEditor
        restaurantId="r1"
        kind="logo"
        name="Eat N Crave"
        currentUrl={null}
      />
    )

    expect(screen.getByRole("button", { name: "Add logo" })).toBeInTheDocument()
  })

  it("offers a Change banner button when a banner exists", () => {
    render(
      <InlineImageEditor
        restaurantId="r1"
        kind="banner"
        name="Eat N Crave"
        currentUrl="https://cdn.test/b.png"
      />
    )

    expect(
      screen.getByRole("button", { name: /change banner/i })
    ).toBeInTheDocument()
  })
})
