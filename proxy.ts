import { NextResponse, type NextRequest } from "next/server"

import { refreshTokens } from "@/features/auth/api/auth-api"
import {
  ACCESS_COOKIE,
  clearSessionCookies,
  DEVICE_COOKIE,
  deviceCookieOptions,
  REFRESH_COOKIE,
  writeSessionCookies,
} from "@/features/auth/session-cookies"
import { ApiError } from "@/lib/api/client"

const PROTECTED_PREFIXES = ["/account", "/onboarding", "/restaurant"]
const HTTP_UNAUTHORIZED = 401
const HTTP_FORBIDDEN = 403

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

function redirectToAuth(request: NextRequest): NextResponse {
  return NextResponse.redirect(new URL("/auth", request.url))
}

/**
 * Optimistic session handling only (see Next.js authentication guide): when
 * the access cookie has expired but a refresh cookie remains, rotate the
 * tokens so the rest of the request sees a fresh session. Real authorization
 * happens in `getSession()` against the API.
 */
export async function proxy(request: NextRequest): Promise<NextResponse> {
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value
  const needsAuth = isProtected(request.nextUrl.pathname)

  // Every browser gets a stable device id on its first request. It rides
  // along on the request (so server actions and components see it via
  // `cookies()`) and, once, on the response so the browser stores it.
  const existingDeviceId = request.cookies.get(DEVICE_COOKIE)?.value
  const deviceId = existingDeviceId ?? crypto.randomUUID()
  if (!existingDeviceId) request.cookies.set(DEVICE_COOKIE, deviceId)

  function withDeviceCookie(response: NextResponse): NextResponse {
    if (!existingDeviceId) {
      response.cookies.set(DEVICE_COOKIE, deviceId, deviceCookieOptions())
    }
    return response
  }

  if (accessToken) return withDeviceCookie(NextResponse.next({ request }))

  if (!refreshToken) {
    const response = needsAuth
      ? redirectToAuth(request)
      : NextResponse.next({ request })
    return withDeviceCookie(response)
  }

  try {
    const tokens = await refreshTokens(refreshToken, deviceId)

    // Forward the new cookies to the downstream request, then to the browser.
    request.cookies.set(ACCESS_COOKIE, tokens.accessToken)
    request.cookies.set(REFRESH_COOKIE, tokens.refreshToken)
    const response = NextResponse.next({ request })
    writeSessionCookies(response.cookies, tokens)
    return withDeviceCookie(response)
  } catch (error) {
    if (!(error instanceof ApiError)) throw error

    const response = needsAuth
      ? redirectToAuth(request)
      : NextResponse.next({ request })
    // Only a rejected token is final; an API outage (5xx) keeps the session.
    if (error.status === HTTP_UNAUTHORIZED || error.status === HTTP_FORBIDDEN) {
      clearSessionCookies(response.cookies)
    }
    return withDeviceCookie(response)
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
