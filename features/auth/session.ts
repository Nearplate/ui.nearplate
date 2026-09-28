import "server-only"

import { cookies } from "next/headers"
import { cache } from "react"

import { ApiError } from "@/lib/api/client"

import { getMe } from "./api/user-api"
import type { AuthResult, User } from "./schemas"
import {
  ACCESS_COOKIE,
  DEVICE_COOKIE,
  GUEST_COOKIE,
  writeSessionCookies,
} from "./session-cookies"

type Authenticated = Extract<AuthResult, { status: "authenticated" }>

/**
 * The signed-in user, or null. An API outage or expired token renders as
 * signed out so public pages keep working; the proxy refreshes tokens.
 */
export const getSession = cache(async (): Promise<User | null> => {
  const accessToken = (await cookies()).get(ACCESS_COOKIE)?.value
  if (!accessToken) return null

  try {
    return await getMe(accessToken)
  } catch (error) {
    if (error instanceof ApiError) return null
    throw error
  }
})

export async function getAccessToken(): Promise<string | null> {
  return (await cookies()).get(ACCESS_COOKIE)?.value ?? null
}

export async function isGuest(): Promise<boolean> {
  return (await cookies()).has(GUEST_COOKIE)
}

/** The browser's stable device id (set by `proxy.ts`), or null if absent. */
export async function getDeviceId(): Promise<string | null> {
  return (await cookies()).get(DEVICE_COOKIE)?.value ?? null
}

/** Stores the session cookies and returns where to send the user next. */
export async function establishSession(result: Authenticated): Promise<string> {
  writeSessionCookies(await cookies(), result)
  if (result.user.role === "restaurant") return "/restaurant"
  return result.user.isOnboarded ? "/" : "/onboarding"
}
