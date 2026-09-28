import "server-only"

import { redirect } from "next/navigation"
import { cache } from "react"

import { getAccessToken, getSession } from "@/features/auth/session"
import type { User } from "@/features/auth/schemas"

import { listMine } from "./api/restaurant-api"
import type { Restaurant } from "./schemas"

/**
 * The signed-in restaurant owner, or redirects. No session goes to `/auth`;
 * a signed-in non-restaurant role goes to `/`. This is the real
 * authorization check -- `proxy.ts` only handles the optimistic case.
 */
export async function requireRestaurantOwner(): Promise<User> {
  const user = await getSession()
  if (!user) redirect("/auth")
  if (user.role !== "restaurant") redirect("/")
  return user
}

/** The caller's restaurant, or null if they haven't onboarded one yet. */
export const getMyRestaurant = cache(async (): Promise<Restaurant | null> => {
  const accessToken = await getAccessToken()
  if (!accessToken) return null
  const restaurants = await listMine(accessToken)
  return restaurants[0] ?? null
})
