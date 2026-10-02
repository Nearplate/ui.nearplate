import "server-only"

import { z } from "zod"

import { env } from "@/config/env"

const REQUEST_TIMEOUT_MS = 10_000
const NO_CONTENT = 204
const SERVICE_UNAVAILABLE = 503

const errorBodySchema = z.object({ code: z.string().optional() })

/**
 * Thrown for any non-2xx answer. The body is `{statusCode}`, plus a `code`
 * for errors from the API's catalogue (e.g. `RESTAURANT_ONBOARDING_LOCKED`).
 */
export class ApiError extends Error {
  readonly status: number
  readonly code?: string

  constructor(status: number, code?: string) {
    super(`API request failed with status ${status}`)
    this.name = "ApiError"
    this.status = status
    this.code = code
  }
}

/** The catalogue `code` from an error body, or undefined if there is none. */
async function readErrorCode(response: Response): Promise<string | undefined> {
  try {
    const body: unknown = await response.json()
    const parsed = errorBodySchema.safeParse(body)
    return parsed.success ? parsed.data.code : undefined
  } catch {
    return undefined
  }
}

interface ApiRequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE"
  body?: unknown
  /** Sent as `Authorization: Bearer <token>`. */
  token?: string
  /** Sent as `X-Device-Id`; binds a session to the browser's `np_device` cookie. */
  deviceId?: string
}

/**
 * Server-to-server call to api.nearplate. Resolves to parsed JSON, or
 * `undefined` for 204. Network failures and timeouts surface as a 503.
 */
export async function apiRequest(
  path: string,
  { method = "GET", body, token, deviceId }: ApiRequestOptions = {}
): Promise<unknown> {
  const headers: Record<string, string> = { Accept: "application/json" }
  if (body !== undefined) headers["Content-Type"] = "application/json"
  if (token) headers.Authorization = `Bearer ${token}`
  if (deviceId) headers["X-Device-Id"] = deviceId

  let response: Response
  try {
    response = await fetch(`${env.API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
  } catch {
    throw new ApiError(SERVICE_UNAVAILABLE)
  }

  if (!response.ok) {
    throw new ApiError(response.status, await readErrorCode(response))
  }
  if (response.status === NO_CONTENT) return undefined
  return response.json()
}

const REDIRECT_MIN = 300
const REDIRECT_MAX = 400

/**
 * Server-to-server call for an endpoint that answers with a redirect (Google
 * sign-in's `GET /auth/google`). Follows nothing itself -- the caller needs
 * the `Location`, not the page it points at.
 */
export async function apiRedirectLocation(path: string): Promise<string> {
  let response: Response
  try {
    response = await fetch(`${env.API_BASE_URL}${path}`, {
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
  } catch {
    throw new ApiError(SERVICE_UNAVAILABLE)
  }

  const location = response.headers.get("location")
  const isRedirect =
    response.status >= REDIRECT_MIN && response.status < REDIRECT_MAX
  if (!isRedirect || !location) throw new ApiError(response.status)
  return location
}
