import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { postToS3WithProgress } from "@/features/media/upload-to-s3"

import {
  confirmDocumentUploadAction,
  removeDocumentAction,
  requestDocumentUploadAction,
} from "../actions"
import { DocumentUploader } from "./document-uploader"

vi.mock("../actions")
vi.mock("@/features/media/upload-to-s3", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/media/upload-to-s3")>()),
  postToS3WithProgress: vi.fn(),
}))

const UPLOADED = {
  contentType: "image/png",
  size: 2048,
  url: "https://s3.test/get",
}

beforeEach(() => {
  vi.resetAllMocks()
})

describe("DocumentUploader", () => {
  it("offers Upload with the accepted types and size when empty", () => {
    render(
      <DocumentUploader restaurantId="r1" type="pan_front" initial={null} />
    )

    expect(screen.getByRole("button", { name: /upload/i })).toBeInTheDocument()
    expect(screen.getByText(/PDF, JPG or PNG · max 5 MB/)).toBeInTheDocument()
    expect(
      screen.getByLabelText("Choose file for PAN · front")
    ).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /remove/i })).toBeNull()
  })

  it("shows View, Replace and Remove for an uploaded document", () => {
    render(
      <DocumentUploader restaurantId="r1" type="pan_front" initial={UPLOADED} />
    )

    expect(screen.getByRole("link", { name: /view/i })).toHaveAttribute(
      "href",
      UPLOADED.url
    )
    expect(screen.getByRole("button", { name: /replace/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /remove/i })).toBeInTheDocument()
    expect(screen.getByText(/2 KB/)).toBeInTheDocument()
  })

  it("uploads a chosen file and shows it as uploaded", async () => {
    vi.mocked(requestDocumentUploadAction).mockResolvedValue({
      ok: true,
      data: {
        type: "pan_front",
        url: "https://s3.test/b",
        fields: { key: "k" },
        expiresAt: "2026-10-02T01:00:00Z",
      },
    })
    vi.mocked(postToS3WithProgress).mockResolvedValue(true)
    vi.mocked(confirmDocumentUploadAction).mockResolvedValue({
      ok: true,
      data: {
        type: "pan_front",
        status: "uploaded",
        ...UPLOADED,
        updatedAt: "2026-10-02T00:00:00Z",
      },
    })
    const user = userEvent.setup({ applyAccept: false })
    render(
      <DocumentUploader restaurantId="r1" type="pan_front" initial={null} />
    )

    await user.upload(
      screen.getByLabelText("Choose file for PAN · front"),
      new File(["x"], "pan.png", { type: "image/png" })
    )

    expect(
      await screen.findByRole("link", { name: /view/i })
    ).toBeInTheDocument()
  })

  it("shows an error for an unsupported file", async () => {
    const user = userEvent.setup({ applyAccept: false })
    render(
      <DocumentUploader restaurantId="r1" type="pan_front" initial={null} />
    )

    await user.upload(
      screen.getByLabelText("Choose file for PAN · front"),
      new File(["x"], "a.gif", { type: "image/gif" })
    )

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /PDF, JPG or PNG/
    )
  })

  it("asks for confirmation before removing", async () => {
    vi.mocked(removeDocumentAction).mockResolvedValue({
      ok: true,
      data: undefined,
    })
    const user = userEvent.setup()
    render(
      <DocumentUploader restaurantId="r1" type="pan_front" initial={UPLOADED} />
    )

    await user.click(screen.getByRole("button", { name: /^remove$/i }))
    expect(removeDocumentAction).not.toHaveBeenCalled()
    const dialog = await screen.findByRole("dialog")
    await user.click(
      Array.from(dialog.querySelectorAll("button")).find(
        (b) => b.textContent === "Remove"
      )!
    )

    await waitFor(() =>
      expect(removeDocumentAction).toHaveBeenCalledWith("r1", "pan_front")
    )
    expect(
      await screen.findByRole("button", { name: /upload/i })
    ).toBeInTheDocument()
  })

  it("is read-only when disabled", () => {
    render(
      <DocumentUploader
        restaurantId="r1"
        type="pan_front"
        initial={UPLOADED}
        disabled
      />
    )

    expect(screen.getByRole("link", { name: /view/i })).toBeInTheDocument()
    expect(screen.queryByRole("button")).toBeNull()
  })
})
