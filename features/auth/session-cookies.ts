import "server-only"

export const ACCESS_COOKIE = "np_at"
export const REFRESH_COOKIE = "np_rt"
export const GUEST_COOKIE = "np_guest"
export const OAUTH_STATE_COOKIE = "np_oauth_state"

const REFRESH_MAX_AGE_SECONDS = 60 * 60 * 24 * 30
const OAUTH_STATE_MAX_AGE_SECONDS = 60 * 10

interface CookieOptions {
  httpOnly: true
  sameSite: "lax"
  secure: boolean
  path: "/"
  maxAge: number
}

function baseOptions(maxAge: number): CookieOptions {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  }
}

export const accessCookieOptions = (expiresIn: number) => baseOptions(expiresIn)
export const refreshCookieOptions = () => baseOptions(REFRESH_MAX_AGE_SECONDS)
export const guestCookieOptions = (expiresIn: number) => baseOptions(expiresIn)
export const oauthStateCookieOptions = () =>
  baseOptions(OAUTH_STATE_MAX_AGE_SECONDS)

/** Minimal cookie-jar shape shared by `cookies()` and `NextResponse.cookies`. */
export interface CookieWriter {
  set(name: string, value: string, options: CookieOptions): unknown
  delete(name: string): unknown
}

/** Writes a fresh access + refresh pair. */
export function writeSessionCookies(
  jar: CookieWriter,
  tokens: { accessToken: string; refreshToken: string; expiresIn: number }
): void {
  jar.set(
    ACCESS_COOKIE,
    tokens.accessToken,
    accessCookieOptions(tokens.expiresIn)
  )
  jar.set(REFRESH_COOKIE, tokens.refreshToken, refreshCookieOptions())
}

export function clearSessionCookies(jar: CookieWriter): void {
  jar.delete(ACCESS_COOKIE)
  jar.delete(REFRESH_COOKIE)
  jar.delete(GUEST_COOKIE)
}
