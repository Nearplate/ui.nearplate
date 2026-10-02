import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { postToS3WithProgress } from "@/features/media/upload-to-s3"

import {
  confirmDocumentUploadAction,
  removeDocumentAction,
  requestDocumentUploadAction,
} from "./actions"
import { useDocumentUpload } from "./use-document-upload"

vi.mock("./actions")
vi.mock("@/features/media/upload-to-s3", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/media/upload-to-s3")>()),
  postToS3WithProgress: vi.fn(),
}))

const PRESIGNED = {
  type: "pan_front" as const,
  url: "https://s3.test/b",
  fields: { key: "k" },
  expiresAt: "2026-10-02T01:00:00Z",
}
const CONFIRMED = {
  type: "pan_front" as const,
  status: "uploaded" as const,
  contentType: "image/png",
  size: 1000,
  url: "https://s3.test/get",
  updatedAt: "2026-10-02T00:00:00Z",
}

function png(size = 1000): File {
  return new File([new Uint8Array(size)], "pan.png", { type: "image/png" })
}

beforeEach(() => {
  vi.resetAllMocks()
  vi.mocked(requestDocumentUploadAction).mockResolvedValue({
    ok: true,
    data: PRESIGNED,
  })
  vi.mocked(confirmDocumentUploadAction).mockResolvedValue({
    ok: true,
    data: CONFIRMED,
  })
  vi.mocked(removeDocumentAction).mockResolvedValue({
    ok: true,
    data: undefined,
  })
  vi.mocked(postToS3WithProgress).mockImplementation(
    async (_url, _form, onProgress) => {
      onProgress(60)
      return true
    }
  )
})

describe("useDocumentUpload", () => {
  it("starts uploaded when an initial document is given", () => {
    const { result } = renderHook(() =>
      useDocumentUpload("r1", "pan_front", {
        contentType: "image/png",
        size: 5,
        url: "https://s3.test/get",
      })
    )

    expect(result.current.status).toBe("uploaded")
  })

  it("uploads: presign, post with progress, confirm", async () => {
    const { result } = renderHook(() =>
      useDocumentUpload("r1", "pan_front", null)
    )

    await act(() => result.current.upload(png()))

    expect(result.current.status).toBe("uploaded")
    expect(result.current.progress).toBe(100)
    expect(result.current.file).toEqual({
      contentType: "image/png",
      size: 1000,
      url: "https://s3.test/get",
    })
    expect(requestDocumentUploadAction).toHaveBeenCalledWith(
      "r1",
      "pan_front",
      "image/png",
      1000
    )
  })

  it("makes no calls for an invalid file", async () => {
    const { result } = renderHook(() =>
      useDocumentUpload("r1", "pan_front", null)
    )
    const gif = new File(["x"], "a.gif", { type: "image/gif" })

    await act(() => result.current.upload(gif))

    expect(result.current.status).toBe("error")
    expect(result.current.error).toMatch(/PDF, JPG/)
    expect(requestDocumentUploadAction).not.toHaveBeenCalled()
  })

  it("removes the pending row when the S3 post fails", async () => {
    vi.mocked(postToS3WithProgress).mockResolvedValue(false)
    const { result } = renderHook(() =>
      useDocumentUpload("r1", "pan_front", null)
    )

    await act(() => result.current.upload(png()))

    expect(removeDocumentAction).toHaveBeenCalledWith("r1", "pan_front")
    expect(confirmDocumentUploadAction).not.toHaveBeenCalled()
    expect(result.current.status).toBe("error")
  })

  it("surfaces a presign failure", async () => {
    vi.mocked(requestDocumentUploadAction).mockResolvedValue({
      ok: false,
      message: "Your details are under review and can't be changed.",
    })
    const { result } = renderHook(() =>
      useDocumentUpload("r1", "pan_front", null)
    )

    await act(() => result.current.upload(png()))

    expect(result.current.error).toMatch(/under review/)
  })

  it("keeps the previous document when a replacement fails", async () => {
    vi.mocked(postToS3WithProgress).mockResolvedValue(false)
    const initial = {
      contentType: "image/png",
      size: 5,
      url: "https://s3.test/old",
    }
    const { result } = renderHook(() =>
      useDocumentUpload("r1", "pan_front", initial)
    )

    await act(() => result.current.upload(png()))

    expect(result.current.file).toEqual(initial)
    expect(result.current.status).toBe("error")
  })

  it("removes a document", async () => {
    const { result } = renderHook(() =>
      useDocumentUpload("r1", "pan_front", {
        contentType: "image/png",
        size: 5,
        url: "https://s3.test/get",
      })
    )

    await act(() => result.current.remove())

    expect(removeDocumentAction).toHaveBeenCalledWith("r1", "pan_front")
    expect(result.current.file).toBeNull()
    expect(result.current.status).toBe("idle")
  })
})
