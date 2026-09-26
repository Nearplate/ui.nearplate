"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { z } from "zod"

import { ApiError } from "@/lib/api/client"

import {
  loginWithGoogle,
  logout,
  requestGuestToken,
  requestMagicLink,
  verifyMagicLink,
} from "./api/auth-api"
import { onboard, updateMe } from "./api/user-api"
import {
  emailSchema,
  nameSchema,
  onboardFormSchema,
  signupRoleSchema,
  type AuthResult,
  type SignupRole,
} from "./schemas"
import { establishSession, getAccessToken } from "./session"
import {
  clearSessionCookies,
  GUEST_COOKIE,
  guestCookieOptions,
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

const HTTP_BAD_REQUEST = 400
const HTTP_UNAUTHORIZED = 401
const HTTP_TOO_MANY_REQUESTS = 429
const HTTP_NOT_IMPLEMENTED = 501

/** User-facing text for an API failure. Unexpected errors are rethrown. */
function errorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    throw error
  }
  switch (error.status) {
    case HTTP_BAD_REQUEST:
      return "Check your details and try again."
    case HTTP_UNAUTHORIZED:
      return "Sign-in failed. The link may have expired; request a new one."
    case HTTP_TOO_MANY_REQUESTS:
      return "Too many attempts. Try again in an hour."
    case HTTP_NOT_IMPLEMENTED:
      return "This sign-in method isn't available right now."
    default:
      return "Something went wrong. Please try again."
  }
}

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
  return completeAuth(() => verifyMagicLink(token))
}

/** Signs in with a Google ID token (POST /auth/google). */
export async function loginWithGoogleAction(
  idToken: string,
  role: SignupRole
): Promise<AuthActionState> {
  return completeAuth(() => loginWithGoogle(idToken, role))
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

const profileFormSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
})

/** Updates the caller's names (PATCH /users/me). */
export async function updateProfileAction(
  _previous: FormActionState,
  formData: FormData
): Promise<FormActionState> {
  const parsed = profileFormSchema.safeParse({
    firstName: formData.get("firstName") || undefined,
    lastName: formData.get("lastName") || undefined,
  })
  if (!parsed.success || Object.keys(parsed.data).length === 0) {
    return { status: "error", message: "Enter a valid name to save." }
  }

  const accessToken = await getAccessToken()
  if (!accessToken) redirect("/auth")

  try {
    await updateMe(accessToken, parsed.data)
  } catch (error) {
    return { status: "error", message: errorMessage(error) }
  }
  revalidatePath("/", "layout")
  return { status: "success" }
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
