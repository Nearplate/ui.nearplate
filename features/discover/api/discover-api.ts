import "server-only"

import { apiRequest } from "@/lib/api/client"

import {
  menuItemSchema,
  restaurantSchema,
  type MenuItem,
  type Restaurant,
} from "@/features/restaurant/schemas"

import { nearbyRestaurantSchema, type NearbyRestaurant } from "../schemas"

export const NEARBY_RADIUS_KM = 10
export const NEARBY_LIMIT = 50

interface NearbyQuery {
  lng: number
  lat: number
  cuisine?: string
  isPureVeg?: boolean
}

/** GET /restaurants/nearby -- online restaurants only, nearest first. Public. */
export async function listNearby({
  lng,
  lat,
  cuisine,
  isPureVeg,
}: NearbyQuery): Promise<NearbyRestaurant[]> {
  const params = new URLSearchParams({
    lng: String(lng),
    lat: String(lat),
    radiusKm: String(NEARBY_RADIUS_KM),
    limit: String(NEARBY_LIMIT),
  })
  if (cuisine) params.set("cuisine", cuisine)
  if (isPureVeg) params.set("isPureVeg", "true")

  const data = (await apiRequest(`/restaurants/nearby?${params}`)) as {
    items: unknown[]
  }
  return data.items.map((item) => nearbyRestaurantSchema.parse(item))
}

/** GET /restaurants/:slug -- also when offline, so the page can say "closed". */
export async function getRestaurantBySlug(slug: string): Promise<Restaurant> {
  return restaurantSchema.parse(
    await apiRequest(`/restaurants/${encodeURIComponent(slug)}`)
  )
}

/** GET /restaurants/:slug/menu -- sorted by category then name. Public. */
export async function getMenuBySlug(slug: string): Promise<MenuItem[]> {
  const data = (await apiRequest(
    `/restaurants/${encodeURIComponent(slug)}/menu`
  )) as { items: unknown[] }
  return data.items.map((item) => menuItemSchema.parse(item))
}
