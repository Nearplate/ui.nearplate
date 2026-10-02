import { revalidatePath } from "next/cache"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { getAccessToken } from "@/features/auth/session"
import { ApiError } from "@/lib/api/client"

import {
  cancelUploadAction,
  confirmUploadAction,
  removeImageAction,
  requestUploadAction,
} from "./actions"
import {
  cancelImageUpload,
  clearImage,
  confirmImageUpload,
  createImageUpload,
} from "./api/media-api"

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`)
  }),
}))
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }))
vi.mock("@/features/auth/session", () => ({ getAccessToken: vi.fn() }))
vi.mock("./api/media-api")

const LOGO = { restaurantId: "r1", kind: "logo" as const }
const DISH = { restaurantId: "r1", kind: "menu_item" as const, itemId: "i1" }
const PRESIGNED = {
  uploadId: "u1",
  url: "https://s3.test/bucket",
  fields: { key: "k" },
  publicUrl: "https://cdn.test/k.png",
  expiresAt: "2026-01-01T00:00:00Z",
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getAccessToken).mockResolvedValue("token")
})

describe("requestUploadAction", () => {
  it("returns the presigned upload", async () => {
    vi.mocked(createImageUpload).mockResolvedValue(PRESIGNED)

    const result = await requestUploadAction(LOGO, "image/png", 1000)

    expect(result).toEqual({ ok: true, data: PRESIGNED })
    expect(createImageUpload).toHaveBeenCalledWith(
      "token",
      LOGO,
      "image/png",
      1000
    )
  })

  it("rejects a disallowed type without calling the API", async () => {
    const result = await requestUploadAction(LOGO, "image/gif", 1000)

    expect(result.ok).toBe(false)
    expect(createImageUpload).not.toHaveBeenCalled()
  })

  it("rejects a file over the per-kind limit", async () => {
    const result = await requestUploadAction(LOGO, "image/png", 3 * 1024 * 1024)

    expect(result.ok).toBe(false)
  })

  it("rejects a menu_item target without an itemId", async () => {
    const result = await requestUploadAction(
      { restaurantId: "r1", kind: "menu_item" },
      "image/png",
      1000
    )

    expect(result.ok).toBe(false)
  })

  it("maps an API failure to a message", async () => {
    vi.mocked(createImageUpload).mockRejectedValue(new ApiError(404))

    const result = await requestUploadAction(LOGO, "image/png", 1000)

    expect(result).toEqual({
      ok: false,
      message: expect.stringMatching(/not found/i),
    })
  })

  it("redirects to /auth without a session", async () => {
    vi.mocked(getAccessToken).mockResolvedValue(null)

    await expect(requestUploadAction(LOGO, "image/png", 1000)).rejects.toThrow(
      "REDIRECT:/auth"
    )
  })
})

describe("confirmUploadAction", () => {
  it("returns the new logo url and revalidates", async () => {
    vi.mocked(confirmImageUpload).mockResolvedValue({
      logoUrl: "https://cdn.test/logo.png",
    } as never)

    const result = await confirmUploadAction(LOGO, "u1")

    expect(result).toEqual({
      ok: true,
      data: { url: "https://cdn.test/logo.png" },
    })
    expect(revalidatePath).toHaveBeenCalled()
  })

  it("returns the dish image url for a menu item", async () => {
    vi.mocked(confirmImageUpload).mockResolvedValue({
      imageUrl: "https://cdn.test/dish.png",
    } as never)

    const result = await confirmUploadAction(DISH, "u1")

    expect(result).toEqual({
      ok: true,
      data: { url: "https://cdn.test/dish.png" },
    })
  })

  it("surfaces a 409 (object missing in S3) as a failure", async () => {
    vi.mocked(confirmImageUpload).mockRejectedValue(new ApiError(409))

    const result = await confirmUploadAction(LOGO, "u1")

    expect(result.ok).toBe(false)
  })
})

describe("cancelUploadAction", () => {
  it("cancels the pending upload", async () => {
    vi.mocked(cancelImageUpload).mockResolvedValue(undefined)

    expect(await cancelUploadAction(LOGO, "u1")).toEqual({
      ok: true,
      data: undefined,
    })
    expect(cancelImageUpload).toHaveBeenCalledWith("token", LOGO, "u1")
  })
})

describe("removeImageAction", () => {
  it("clears the slot and revalidates", async () => {
    vi.mocked(clearImage).mockResolvedValue(undefined)

    expect(await removeImageAction(DISH)).toEqual({ ok: true, data: undefined })
    expect(clearImage).toHaveBeenCalledWith("token", DISH)
    expect(revalidatePath).toHaveBeenCalled()
  })
})
