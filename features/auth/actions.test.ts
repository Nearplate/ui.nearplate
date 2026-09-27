import { beforeEach, describe, expect, it, vi } from "vitest"

import { ApiError } from "@/lib/api/client"

import {
  requestMagicLinkAction,
  startGoogleAction,
  verifyMagicLinkAction,
} from "./actions"
import {
  googleAuthorizeUrl,
  requestMagicLink,
  verifyMagicLink,
} from "./api/auth-api"
import { establishSession } from "./session"

const cookieSet = vi.fn()
const cookieDelete = vi.fn()

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`)
  }),
}))
vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    set: cookieSet,
    delete: cookieDelete,
    get: vi.fn(),
  })),
}))
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }))
vi.mock("./api/auth-api")
vi.mock("./api/user-api")
vi.mock("./session", () => ({
  establishSession: vi.fn(),
  getAccessToken: vi.fn(),
  getDeviceId: vi.fn(),
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

describe("startGoogleAction", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("stores the state cookie and redirects to Google", async () => {
    vi.mocked(googleAuthorizeUrl).mockResolvedValue(
      "https://accounts.google.com/o/oauth2/v2/auth?state=abc123&other=1"
    )

    await expect(
      startGoogleAction(form({ role: "restaurant" }))
    ).rejects.toThrow(
      "REDIRECT:https://accounts.google.com/o/oauth2/v2/auth?state=abc123&other=1"
    )

    expect(googleAuthorizeUrl).toHaveBeenCalledWith("restaurant")
    expect(cookieSet).toHaveBeenCalledWith(
      "np_oauth_state",
      "abc123",
      expect.any(Object)
    )
  })

  it("defaults to the user role when none is given", async () => {
    vi.mocked(googleAuthorizeUrl).mockResolvedValue(
      "https://accounts.google.com/o/oauth2/v2/auth?state=xyz"
    )

    await expect(startGoogleAction(form({}))).rejects.toThrow("REDIRECT:")
    expect(googleAuthorizeUrl).toHaveBeenCalledWith("user")
  })

  it("falls back to the unavailable notice on an API error", async () => {
    vi.mocked(googleAuthorizeUrl).mockRejectedValue(new ApiError(503))

    await expect(startGoogleAction(form({ role: "user" }))).rejects.toThrow(
      "REDIRECT:/auth?error=google"
    )

    expect(cookieSet).not.toHaveBeenCalled()
  })

  it("falls back to the unavailable notice when no state is returned", async () => {
    vi.mocked(googleAuthorizeUrl).mockResolvedValue(
      "https://accounts.google.com/o/oauth2/v2/auth?other=1"
    )

    await expect(startGoogleAction(form({ role: "user" }))).rejects.toThrow(
      "REDIRECT:/auth?error=google"
    )

    expect(cookieSet).not.toHaveBeenCalled()
  })
})
