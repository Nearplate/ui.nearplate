import { beforeEach, describe, expect, it, vi } from "vitest"

import { ApiError } from "@/lib/api/client"

import {
  loginWithGoogleAction,
  requestMagicLinkAction,
  verifyMagicLinkAction,
} from "./actions"
import {
  loginWithGoogle,
  requestMagicLink,
  verifyMagicLink,
} from "./api/auth-api"
import { establishSession } from "./session"

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`)
  }),
}))
vi.mock("next/headers", () => ({ cookies: vi.fn() }))
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }))
vi.mock("./api/auth-api")
vi.mock("./api/user-api")
vi.mock("./session", () => ({
  establishSession: vi.fn(),
  getAccessToken: vi.fn(),
}))

const IDLE = { status: "idle" } as const

function form(values: Record<string, string>): FormData {
  const data = new FormData()
  Object.entries(values).forEach(([key, value]) => data.set(key, value))
  return data
}

const AUTHENTICATED = {
  status: "authenticated",
  user: {
    id: "u1",
    email: "a@b.co",
    role: "user",
    firstName: null,
    lastName: null,
    isOnboarded: false,
    avatarUrl: null,
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  accessToken: "at",
  refreshToken: "rt",
  expiresIn: 900,
} as const

describe("requestMagicLinkAction", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("rejects an invalid email without calling the API", async () => {
    const state = await requestMagicLinkAction(
      IDLE,
      form({ email: "nope", role: "user" })
    )

    expect(state).toEqual({
      status: "error",
      message: "Enter a valid email address.",
    })
    expect(requestMagicLink).not.toHaveBeenCalled()
  })

  it("sends the normalized email and role, then reports sent", async () => {
    vi.mocked(requestMagicLink).mockResolvedValue({ status: "sent" })

    const state = await requestMagicLinkAction(
      IDLE,
      form({ email: " Asha@Example.com ", role: "restaurant" })
    )

    expect(requestMagicLink).toHaveBeenCalledWith(
      "asha@example.com",
      "restaurant"
    )
    expect(state).toEqual({ status: "sent", email: "asha@example.com" })
  })

  it("surfaces a role mismatch", async () => {
    vi.mocked(requestMagicLink).mockResolvedValue({
      status: "role_mismatch",
      role: "restaurant",
    })

    const state = await requestMagicLinkAction(
      IDLE,
      form({ email: "a@b.co", role: "user" })
    )

    expect(state).toEqual({ status: "role_mismatch", role: "restaurant" })
  })

  it("explains a rate limit (429)", async () => {
    vi.mocked(requestMagicLink).mockRejectedValue(new ApiError(429))

    const state = await requestMagicLinkAction(
      IDLE,
      form({ email: "a@b.co", role: "user" })
    )

    expect(state).toMatchObject({
      status: "error",
      message: expect.stringContaining("Too many attempts"),
    })
  })

  it("rethrows unexpected errors", async () => {
    vi.mocked(requestMagicLink).mockRejectedValue(new Error("boom"))

    await expect(
      requestMagicLinkAction(IDLE, form({ email: "a@b.co", role: "user" }))
    ).rejects.toThrow("boom")
  })
})

describe("verifyMagicLinkAction", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("stores the session and redirects when authenticated", async () => {
    vi.mocked(verifyMagicLink).mockResolvedValue(AUTHENTICATED)
    vi.mocked(establishSession).mockResolvedValue("/onboarding")

    await expect(verifyMagicLinkAction("tok")).rejects.toThrow(
      "REDIRECT:/onboarding"
    )
    expect(establishSession).toHaveBeenCalledWith(AUTHENTICATED)
  })

  it("returns an error for an expired token (401)", async () => {
    vi.mocked(verifyMagicLink).mockRejectedValue(new ApiError(401))

    const state = await verifyMagicLinkAction("tok")

    expect(state).toMatchObject({ status: "error" })
    expect(establishSession).not.toHaveBeenCalled()
  })
})

describe("loginWithGoogleAction", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("reports unavailable when the API has no Google client (501)", async () => {
    vi.mocked(loginWithGoogle).mockRejectedValue(new ApiError(501))

    const state = await loginWithGoogleAction("id-token", "user")

    expect(state).toMatchObject({
      status: "error",
      message: expect.stringContaining("isn't available"),
    })
  })

  it("returns role_mismatch without creating a session", async () => {
    vi.mocked(loginWithGoogle).mockResolvedValue({
      status: "role_mismatch",
      role: "restaurant",
    })

    const state = await loginWithGoogleAction("id-token", "user")

    expect(state).toEqual({ status: "role_mismatch", role: "restaurant" })
    expect(establishSession).not.toHaveBeenCalled()
  })
})
