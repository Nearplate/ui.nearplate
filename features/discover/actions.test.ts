import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { setFeedLocationAction } from "./actions"

vi.mock("next/headers", () => ({ cookies: vi.fn() }))
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }))

const set = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(cookies).mockResolvedValue({ set } as never)
})

describe("setFeedLocationAction", () => {
  it("stores a valid location in the np_loc cookie and revalidates home", async () => {
    const result = await setFeedLocationAction({
      lng: 77.2,
      lat: 28.6,
      label: "Connaught Place",
    })

    expect(result).toEqual({ ok: true })
    expect(set).toHaveBeenCalledWith(
      "np_loc",
      JSON.stringify({ lng: 77.2, lat: 28.6, label: "Connaught Place" }),
      expect.objectContaining({ httpOnly: true, sameSite: "lax", path: "/" })
    )
    expect(revalidatePath).toHaveBeenCalledWith("/")
  })

  it("rejects out-of-range coordinates without setting a cookie", async () => {
    const result = await setFeedLocationAction({
      lng: 500,
      lat: 28.6,
      label: "Nowhere",
    })

    expect(result).toEqual({ ok: false })
    expect(set).not.toHaveBeenCalled()
  })

  it("rejects a non-object payload", async () => {
    const result = await setFeedLocationAction("hello" as never)

    expect(result).toEqual({ ok: false })
    expect(set).not.toHaveBeenCalled()
  })
})
