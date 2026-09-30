import { feedLocationSchema, type FeedLocation } from "./schemas"

/** httpOnly cookie holding the JSON-encoded `FeedLocation`. */
export const LOCATION_COOKIE = "np_loc"
export const LOCATION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30

const MAX_CUISINE = 40
const VEG_ON = "1"

type SearchParams = Record<string, string | string[] | undefined>

/** The default-address fields the feed needs. */
export interface AddressPin {
  lat: number | null
  lng: number | null
  city: string
  line1: string
}

export interface FeedFilters {
  cuisine: string | undefined
  veg: boolean
}

/** Cookie value -> a valid location, or null when absent or tampered with. */
export function parseLocationCookie(
  raw: string | undefined
): FeedLocation | null {
  if (!raw) return null
  try {
    const parsed = feedLocationSchema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

/** Cookie first, then the signed-in user's pinned default address. */
export function resolveFeedLocation(
  fromCookie: FeedLocation | null,
  defaultAddress: AddressPin | null
): FeedLocation | null {
  if (fromCookie) return fromCookie
  if (
    !defaultAddress ||
    defaultAddress.lat === null ||
    defaultAddress.lng === null
  ) {
    return null
  }
  return {
    lng: defaultAddress.lng,
    lat: defaultAddress.lat,
    label: `${defaultAddress.line1}, ${defaultAddress.city}`,
  }
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

/** Validates the `cuisine` / `veg` search params; anything odd is dropped. */
export function parseFeedFilters(params: SearchParams): FeedFilters {
  const cuisine = first(params.cuisine)?.trim().toLowerCase()
  return {
    cuisine: cuisine && cuisine.length <= MAX_CUISINE ? cuisine : undefined,
    veg: first(params.veg) === VEG_ON,
  }
}
