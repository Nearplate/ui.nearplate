import "server-only"

import { apiRequest } from "@/lib/api/client"

import {
  orderDetailSchema,
  orderPageSchema,
  pageOffset,
  ORDERS_PAGE_SIZE,
  type OrderDetail,
  type OrderPage,
} from "../schemas"

/** GET /orders/:id, one of the caller's own orders with its lines. */
export async function getMyOrder(
  accessToken: string,
  id: string
): Promise<OrderDetail> {
  return orderDetailSchema.parse(
    await apiRequest(`/orders/${encodeURIComponent(id)}`, {
      token: accessToken,
    })
  )
}

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
