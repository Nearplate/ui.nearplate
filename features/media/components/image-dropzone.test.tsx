import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { ImageDropzone } from "./image-dropzone"

vi.mock("../actions")

const LOGO = { restaurantId: "r1", kind: "logo" as const }

describe("ImageDropzone", () => {
  it("offers Upload and shows the default avatar when there is no image", () => {
    render(<ImageDropzone target={LOGO} name="Spice Hub" currentUrl={null} />)

    expect(screen.getByRole("button", { name: /upload/i })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /remove/i })).toBeNull()
    expect(screen.getByText("S")).toBeInTheDocument()
  })

  it("offers Replace and Remove when an image exists", () => {
    render(
      <ImageDropzone
        target={LOGO}
        name="Spice Hub"
        currentUrl="https://cdn.test/logo.png"
      />
    )

    expect(screen.getByRole("button", { name: /replace/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /remove/i })).toBeInTheDocument()
  })

  it("rejects a wrong file type with a message", async () => {
    const user = userEvent.setup({ applyAccept: false })
    render(<ImageDropzone target={LOGO} name="Spice Hub" currentUrl={null} />)

    await user.upload(
      screen.getByLabelText(/choose logo image/i),
      new File(["x"], "a.gif", { type: "image/gif" })
    )

    expect(
      await screen.findByText(/JPG, PNG or WebP image/)
    ).toBeInTheDocument()
  })
})
