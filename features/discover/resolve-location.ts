import "server-only"

import { cookies } from "next/headers"

import { listAddresses } from "@/features/account/api/address-api"
import { getAccessToken } from "@/features/auth/session"
import { ApiError } from "@/lib/api/client"

import {
  LOCATION_COOKIE,
  parseLocationCookie,
  resolveFeedLocation,
} from "./location"
import type { FeedLocation } from "./schemas"

/** The visitor's saved location, else their default address pin, else null. */
export async function getFeedLocation(): Promise<FeedLocation | null> {
  const fromCookie = parseLocationCookie(
    (await cookies()).get(LOCATION_COOKIE)?.value
  )
  if (fromCookie) return fromCookie

  const accessToken = await getAccessToken()
  if (!accessToken) return null

  try {
    const [defaultAddress] = await listAddresses(accessToken)
    return resolveFeedLocation(null, defaultAddress ?? null)
  } catch (error) {
    if (error instanceof ApiError) return null
    throw error
  }
}
