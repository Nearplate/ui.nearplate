import { beforeEach, describe, expect, it, vi } from "vitest"

import { ApiError } from "@/lib/api/client"

import { verifyGoogle } from "./api/auth-api"
import { completeGoogleSignIn } from "./google-callback"
import { establishSession } from "./session"

const cookieGet = vi.fn()
const cookieDelete = vi.fn()

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: cookieGet,
    delete: cookieDelete,
  })),
}))
vi.mock("./api/auth-api")
vi.mock("./session", () => ({
  establishSession: vi.fn(),
  getDeviceId: vi.fn(),
}))

const AUTHENTICATED = {
  status: "authenticated",
  user: {
    id: "u1",
    email: "a@b.co",
    role: "user",
    firstName: null,
    lastName: null,
    isOnboarded: true,
    avatarUrl: null,
    phoneNumber: null,
    dateOfBirth: null,
    anniversaryDate: null,
    gender: null,
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  accessToken: "at",
  refreshToken: "rt",
  expiresIn: 900,
} as const

function params(values: Record<string, string>): URLSearchParams {
  return new URLSearchParams(values)
}

describe("completeGoogleSignIn", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    cookieGet.mockReturnValue({ value: "state123" })
  })

  it("verifies the code and establishes a session on success", async () => {
    vi.mocked(verifyGoogle).mockResolvedValue(AUTHENTICATED)
    vi.mocked(establishSession).mockResolvedValue("/")

    const path = await completeGoogleSignIn(
      params({ code: "c1", state: "state123" })
    )

    expect(verifyGoogle).toHaveBeenCalledWith("c1", "state123", undefined)
    expect(establishSession).toHaveBeenCalledWith(AUTHENTICATED)
    expect(path).toBe("/")
    expect(cookieDelete).toHaveBeenCalledWith("np_oauth_state")
  })

  it("rejects a state that doesn't match the cookie", async () => {
    const path = await completeGoogleSignIn(
      params({ code: "c1", state: "wrong" })
    )

    expect(path).toBe("/auth?error=google")
    expect(verifyGoogle).not.toHaveBeenCalled()
  })

  it("rejects when the state cookie is missing", async () => {
    cookieGet.mockReturnValue(undefined)

    const path = await completeGoogleSignIn(
      params({ code: "c1", state: "state123" })
    )

    expect(path).toBe("/auth?error=google")
    expect(verifyGoogle).not.toHaveBeenCalled()
  })

  it("rejects when Google reports an error", async () => {
    const path = await completeGoogleSignIn(
      params({ error: "access_denied", state: "state123" })
    )

    expect(path).toBe("/auth?error=google")
    expect(verifyGoogle).not.toHaveBeenCalled()
  })

  it("redirects with the role on a role mismatch", async () => {
    vi.mocked(verifyGoogle).mockResolvedValue({
      status: "role_mismatch",
      role: "restaurant",
    })

    const path = await completeGoogleSignIn(
      params({ code: "c1", state: "state123" })
    )

    expect(path).toBe("/auth?error=role_mismatch&role=restaurant")
    expect(establishSession).not.toHaveBeenCalled()
  })

  it("falls back to the error notice on an ApiError", async () => {
    vi.mocked(verifyGoogle).mockRejectedValue(new ApiError(401))

    const path = await completeGoogleSignIn(
      params({ code: "c1", state: "state123" })
    )

    expect(path).toBe("/auth?error=google")
  })

  it("rethrows unexpected errors", async () => {
    vi.mocked(verifyGoogle).mockRejectedValue(new Error("boom"))

    await expect(
      completeGoogleSignIn(params({ code: "c1", state: "state123" }))
    ).rejects.toThrow("boom")
  })
})
