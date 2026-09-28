"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { z } from "zod"

import { ApiError } from "@/lib/api/client"
import { errorMessage } from "@/lib/api/error-message"

import {
  googleAuthorizeUrl,
  logout,
  requestGuestToken,
  requestMagicLink,
  verifyMagicLink,
} from "./api/auth-api"
import { onboard } from "./api/user-api"
import {
  emailSchema,
  onboardFormSchema,
  signupRoleSchema,
  type AuthResult,
} from "./schemas"
import { establishSession, getAccessToken, getDeviceId } from "./session"
import {
  clearSessionCookies,
  GUEST_COOKIE,
  guestCookieOptions,
  OAUTH_STATE_COOKIE,
  oauthStateCookieOptions,
  REFRESH_COOKIE,
} from "./session-cookies"

export type AuthActionState =
  | { status: "idle" }
  | { status: "sent"; email: string }
  | { status: "role_mismatch"; role: string }
  | { status: "error"; message: string }

export type FormActionState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string }

async function completeAuth(
  authenticate: () => Promise<AuthResult>
): Promise<AuthActionState> {
  let result: AuthResult
  try {
    result = await authenticate()
  } catch (error) {
    return { status: "error", message: errorMessage(error) }
  }

  if (result.status === "role_mismatch") {
    return { status: "role_mismatch", role: result.role }
  }
  redirect(await establishSession(result))
}

const magicLinkFormSchema = z.object({
  email: emailSchema,
  role: signupRoleSchema,
})

/** Emails a sign-in link (POST /auth/magic-link). */
export async function requestMagicLinkAction(
  _previous: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = magicLinkFormSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role"),
  })
  if (!parsed.success) {
    return { status: "error", message: "Enter a valid email address." }
  }

  try {
    const result = await requestMagicLink(parsed.data.email, parsed.data.role)
    return result.status === "sent"
      ? { status: "sent", email: parsed.data.email }
      : result
  } catch (error) {
    return { status: "error", message: errorMessage(error) }
  }
}

/** Exchanges the emailed token for a session (POST /auth/magic-link/verify). */
export async function verifyMagicLinkAction(
  token: string
): Promise<AuthActionState> {
  const deviceId = await getDeviceId()
  return completeAuth(() => verifyMagicLink(token, deviceId))
}

/**
 * Starts the redirect flow (GET /auth/google): stashes the `state` Google
 * will echo back in a short-lived httpOnly cookie (checked by the callback
 * route as CSRF protection for the round trip), then sends the browser to
 * Google. Falls back to the same "unavailable" notice as guest sign-in.
 */
export async function startGoogleAction(formData: FormData): Promise<void> {
  const parsed = signupRoleSchema.safeParse(formData.get("role"))
  const role = parsed.success ? parsed.data : "user"

  let url: string
  try {
    url = await googleAuthorizeUrl(role)
  } catch (error) {
    errorMessage(error)
    redirect("/auth?error=google")
    return
  }

  const state = new URL(url).searchParams.get("state")
  if (!state) redirect("/auth?error=google")

  ;(await cookies()).set(OAUTH_STATE_COOKIE, state, oauthStateCookieOptions())
  redirect(url)
}

/** Anonymous browsing (POST /auth/guest). */
export async function continueAsGuestAction(): Promise<void> {
  let guest: Awaited<ReturnType<typeof requestGuestToken>>
  try {
    guest = await requestGuestToken()
  } catch (error) {
    errorMessage(error)
    redirect("/auth?error=guest")
  }

  ;(await cookies()).set(
    GUEST_COOKIE,
    guest.accessToken,
    guestCookieOptions(guest.expiresIn)
  )
  redirect("/")
}

/** Sets first and last name (POST /users/me/onboard). */
export async function onboardAction(
  _previous: FormActionState,
  formData: FormData
): Promise<FormActionState> {
  const parsed = onboardFormSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
  })
  if (!parsed.success) {
    return { status: "error", message: "Enter your first and last name." }
  }

  const accessToken = await getAccessToken()
  if (!accessToken) redirect("/auth")

  try {
    await onboard(accessToken, parsed.data)
  } catch (error) {
    return { status: "error", message: errorMessage(error) }
  }
  revalidatePath("/", "layout")
  redirect("/")
}

/**
 * Revokes the refresh session (POST /auth/logout) and clears cookies. The
 * cookies are cleared even if the API is unreachable, so the user is always
 * signed out locally; the API answers 204 for unknown tokens.
 */
export async function logoutAction(): Promise<void> {
  const jar = await cookies()
  const refreshToken = jar.get(REFRESH_COOKIE)?.value

  if (refreshToken) {
    try {
      await logout(refreshToken)
    } catch (error) {
      if (!(error instanceof ApiError)) throw error
    }
  }
  clearSessionCookies(jar)
  redirect("/auth")
}
