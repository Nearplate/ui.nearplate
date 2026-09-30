import { z } from "zod"

import { RESTAURANT_STATUSES } from "@/features/restaurant/schemas"

export const cartLineSchema = z.object({
  menuItemId: z.string(),
  name: z.string(),
  imageUrl: z.string().nullable(),
  priceInPaise: z.number().int(),
  quantity: z.number().int(),
  lineTotalInPaise: z.number().int(),
  isAvailable: z.boolean(),
})
export type CartLine = z.infer<typeof cartLineSchema>

/**
 * A priced cart. The API returns this shape for server carts, and guest carts
 * are stored in localStorage in the same shape, so one set of components and
 * pure functions (`cart-state.ts`) serves both.
 */
export const cartSchema = z.object({
  restaurantId: z.string(),
  restaurant: z.object({
    name: z.string(),
    slug: z.string(),
    status: z.enum(RESTAURANT_STATUSES),
  }),
  items: z.array(cartLineSchema),
  itemCount: z.number().int(),
  subtotalInPaise: z.number().int(),
  totalInPaise: z.number().int(),
  canCheckout: z.boolean(),
  updatedAt: z.string(),
})
export type Cart = z.infer<typeof cartSchema>

export const cartListSchema = z.object({ items: z.array(cartSchema) })

/** What is read back from localStorage; anything malformed is discarded. */
export const guestCartsSchema = z.array(cartSchema)

/** The restaurant fields a cart needs when a first line is added. */
export interface RestaurantRef {
  id: string
  slug: string
  name: string
  status: Cart["restaurant"]["status"]
}

/** The menu-item fields a cart line needs. */
export interface MenuItemRef {
  id: string
  name: string
  imageUrl: string | null
  priceInPaise: number
  isAvailable: boolean
}

/** Body of `POST /carts/merge`. */
export interface MergeCartsPayload {
  carts: {
    restaurantId: string
    items: { menuItemId: string; quantity: number }[]
  }[]
}
