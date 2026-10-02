import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  cancelUploadAction,
  confirmUploadAction,
  requestUploadAction,
} from "./actions"
import { useImageUpload } from "./use-image-upload"

vi.mock("./actions")

const TARGET = { restaurantId: "r1", kind: "logo" as const }
const PRESIGNED = {
  uploadId: "u1",
  url: "https://s3.test/bucket",
  fields: { key: "k" },
  publicUrl: "https://cdn.test/k.png",
  expiresAt: "2026-01-01T00:00:00Z",
}

function png(size = 1000) {
  return new File([new Uint8Array(size)], "a.png", { type: "image/png" })
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }))
  vi.stubGlobal("URL", {
    ...URL,
    createObjectURL: vi.fn(() => "blob:preview"),
    revokeObjectURL: vi.fn(),
  })
})

describe("useImageUpload", () => {
  it("uploads, confirms and reports the new url", async () => {
    vi.mocked(requestUploadAction).mockResolvedValue({
      ok: true,
      data: PRESIGNED,
    })
    vi.mocked(confirmUploadAction).mockResolvedValue({
      ok: true,
      data: { url: "https://cdn.test/k.png" },
    })
    const onUploaded = vi.fn()
    const { result } = renderHook(() => useImageUpload(TARGET, { onUploaded }))

    await act(() => result.current.upload(png()))

    expect(result.current.status).toBe("done")
    expect(onUploaded).toHaveBeenCalledWith("https://cdn.test/k.png")
    expect(confirmUploadAction).toHaveBeenCalledWith(TARGET, "u1")
  })

  it("rejects an oversize file before any request", async () => {
    const { result } = renderHook(() => useImageUpload(TARGET))

    await act(() => result.current.upload(png(3 * 1024 * 1024)))

    expect(result.current.status).toBe("error")
    expect(result.current.error).toMatch(/2 MB/)
    expect(requestUploadAction).not.toHaveBeenCalled()
  })

  it("cancels the pending upload when the S3 POST fails", async () => {
    vi.mocked(requestUploadAction).mockResolvedValue({
      ok: true,
      data: PRESIGNED,
    })
    vi.mocked(cancelUploadAction).mockResolvedValue({
      ok: true,
      data: undefined,
    })
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }))
    const { result } = renderHook(() => useImageUpload(TARGET))

    await act(() => result.current.upload(png()))

    expect(result.current.status).toBe("error")
    expect(cancelUploadAction).toHaveBeenCalledWith(TARGET, "u1")
    expect(confirmUploadAction).not.toHaveBeenCalled()
  })

  it("shows the API message when the presign request fails", async () => {
    vi.mocked(requestUploadAction).mockResolvedValue({
      ok: false,
      message: "Not found.",
    })
    const { result } = renderHook(() => useImageUpload(TARGET))

    await act(() => result.current.upload(png()))

    expect(result.current.error).toBe("Not found.")
  })
})
