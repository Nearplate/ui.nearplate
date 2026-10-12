import "server-only"

import { z } from "zod"

import {
  orderSummarySchema,
  type OrderStatus,
} from "@/features/account/schemas"
import { apiRequest } from "@/lib/api/client"

/** An incoming order as the owner sees it (no restaurant name, no lines). */
export const ownerOrderSchema = orderSummarySchema.omit({
  restaurantName: true,
})
export type OwnerOrder = z.infer<typeof ownerOrderSchema>

const ownerOrderPageSchema = z.object({
  items: z.array(ownerOrderSchema),
  total: z.number(),
})

/** The API's page-size ceiling for order lists. */
export const OWNER_ORDERS_LIMIT = 100

/** GET /restaurants/:id/orders, newest first (the latest page only). */
export async function listRestaurantOrders(
  accessToken: string,
  restaurantId: string
): Promise<OwnerOrder[]> {
  const page = ownerOrderPageSchema.parse(
    await apiRequest(
      `/restaurants/${encodeURIComponent(restaurantId)}/orders?limit=${OWNER_ORDERS_LIMIT}`,
      { token: accessToken }
    )
  )
  return page.items
}

/** PATCH /restaurants/:id/orders/:orderId/status */
export async function updateRestaurantOrderStatus(
  accessToken: string,
  restaurantId: string,
  orderId: string,
  status: OrderStatus
): Promise<OwnerOrder> {
  return ownerOrderSchema.parse(
    await apiRequest(
      `/restaurants/${encodeURIComponent(restaurantId)}/orders/${encodeURIComponent(orderId)}/status`,
      { method: "PATCH", body: { status }, token: accessToken }
    )
  )
}
