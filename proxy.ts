import { NextResponse, type NextRequest } from "next/server"

import { refreshTokens } from "@/features/auth/api/auth-api"
import {
  ACCESS_COOKIE,
  clearSessionCookies,
  REFRESH_COOKIE,
  writeSessionCookies,
} from "@/features/auth/session-cookies"
import { ApiError } from "@/lib/api/client"

const PROTECTED_PREFIXES = ["/account", "/onboarding"]
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

  if (accessToken) return NextResponse.next()

  if (!refreshToken) {
    return needsAuth ? redirectToAuth(request) : NextResponse.next()
  }

  try {
    const tokens = await refreshTokens(refreshToken)

    // Forward the new cookies to the downstream request, then to the browser.
    request.cookies.set(ACCESS_COOKIE, tokens.accessToken)
    request.cookies.set(REFRESH_COOKIE, tokens.refreshToken)
    const response = NextResponse.next({ request })
    writeSessionCookies(response.cookies, tokens)
    return response
  } catch (error) {
    if (!(error instanceof ApiError)) throw error

    const response = needsAuth ? redirectToAuth(request) : NextResponse.next()
    // Only a rejected token is final; an API outage (5xx) keeps the session.
    if (error.status === HTTP_UNAUTHORIZED || error.status === HTTP_FORBIDDEN) {
      clearSessionCookies(response.cookies)
    }
    return response
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
