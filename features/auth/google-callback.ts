import "server-only"

import { cookies } from "next/headers"

import { ApiError } from "@/lib/api/client"

import { verifyGoogle } from "./api/auth-api"
import { establishSession } from "./session"
import { OAUTH_STATE_COOKIE } from "./session-cookies"

/**
 * Handles Google's redirect back to `GOOGLE_REDIRECT_URI`: checks `state`
 * against the httpOnly cookie set by `startGoogleAction` (CSRF protection
 * for the round trip, one-time since the cookie is deleted either way),
 * then exchanges `code` server-to-server. Returns where to send the browser
 * next -- never throws for an expected failure, so the callback route
 * always has somewhere to redirect to.
 */
export async function completeGoogleSignIn(
  searchParams: URLSearchParams
): Promise<string> {
  const jar = await cookies()
  const expectedState = jar.get(OAUTH_STATE_COOKIE)?.value
  jar.delete(OAUTH_STATE_COOKIE)

  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const googleError = searchParams.get("error")
  if (
    googleError ||
    !code ||
    !state ||
    !expectedState ||
    state !== expectedState
  ) {
    return "/auth?error=google"
  }

  try {
    const result = await verifyGoogle(code, state)
    if (result.status === "role_mismatch") {
      return `/auth?error=role_mismatch&role=${encodeURIComponent(result.role)}`
    }
    return establishSession(result)
  } catch (error) {
    if (error instanceof ApiError) return "/auth?error=google"
    throw error
  }
}
