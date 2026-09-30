import { z } from "zod"

import { restaurantSchema } from "@/features/restaurant/schemas"

const MAX_LNG = 180
const MAX_LAT = 90
const MAX_LABEL = 120

export const nearbyRestaurantSchema = restaurantSchema.extend({
  distanceMeters: z.number().nonnegative(),
})
export type NearbyRestaurant = z.infer<typeof nearbyRestaurantSchema>

/** Where the feed is centred; `label` is what the location bar shows. */
export const feedLocationSchema = z.object({
  lng: z.number().min(-MAX_LNG).max(MAX_LNG),
  lat: z.number().min(-MAX_LAT).max(MAX_LAT),
  label: z.string().trim().min(1).max(MAX_LABEL),
})
export type FeedLocation = z.infer<typeof feedLocationSchema>
