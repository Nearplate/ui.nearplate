import "server-only"

import { apiRequest } from "@/lib/api/client"

import {
  orderPageSchema,
  pageOffset,
  ORDERS_PAGE_SIZE,
  type OrderPage,
} from "../schemas"

/** GET /orders/mine?limit&offset, newest first, with each restaurant's name. */
export async function listMyOrders(
  accessToken: string,
  page: number
): Promise<OrderPage> {
  return orderPageSchema.parse(
    await apiRequest(
      `/orders/mine?limit=${ORDERS_PAGE_SIZE}&offset=${pageOffset(page)}`,
      { token: accessToken }
    )
  )
}
