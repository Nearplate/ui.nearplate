import "server-only"

import { apiRequest } from "@/lib/api/client"

import {
  authResultSchema,
  guestResultSchema,
  magicLinkResultSchema,
  tokensSchema,
  type AuthResult,
  type GuestResult,
  type MagicLinkResult,
  type SignupRole,
  type Tokens,
} from "../schemas"

/** POST /auth/magic-link: emails a sign-in link. */
export async function requestMagicLink(
  email: string,
  role: SignupRole
): Promise<MagicLinkResult> {
  const data = await apiRequest("/auth/magic-link", {
    method: "POST",
    body: { email, role },
  })
  return magicLinkResultSchema.parse(data)
}

/** POST /auth/magic-link/verify: exchanges the emailed token for a session. */
export async function verifyMagicLink(token: string): Promise<AuthResult> {
  const data = await apiRequest("/auth/magic-link/verify", {
    method: "POST",
    body: { token },
  })
  return authResultSchema.parse(data)
}

/** POST /auth/google: signs in with a Google ID token. */
export async function loginWithGoogle(
  idToken: string,
  role: SignupRole
): Promise<AuthResult> {
  const data = await apiRequest("/auth/google", {
    method: "POST",
    body: { idToken, role },
  })
  return authResultSchema.parse(data)
}

/** POST /auth/refresh: rotates the refresh token. */
export async function refreshTokens(refreshToken: string): Promise<Tokens> {
  const data = await apiRequest("/auth/refresh", {
    method: "POST",
    body: { refreshToken },
  })
  return tokensSchema.parse(data)
}

/** POST /auth/logout: revokes the refresh session (204). */
export async function logout(refreshToken: string): Promise<void> {
  await apiRequest("/auth/logout", { method: "POST", body: { refreshToken } })
}

/** POST /auth/guest: anonymous guest access token. */
export async function requestGuestToken(): Promise<GuestResult> {
  const data = await apiRequest("/auth/guest", { method: "POST" })
  return guestResultSchema.parse(data)
}
