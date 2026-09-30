import "server-only"

import { orderDetailSchema, type OrderDetail } from "@/features/account/schemas"
import { apiRequest } from "@/lib/api/client"

import {
  cartListSchema,
  cartSchema,
  type Cart,
  type MergeCartsPayload,
} from "../schemas"

/** The address snapshot an order stores; a saved address minus its account fields. */
export interface DeliveryAddress {
  line1: string
  line2: string | null
  city: string
  state: string
  zipcode: string
  phoneNumber: string | null
  label?: string | null
}

function cartPath(restaurantId: string): string {
  return `/carts/${encodeURIComponent(restaurantId)}`
}

/** GET /carts, most recently touched first. */
export async function listCarts(accessToken: string): Promise<Cart[]> {
  return cartListSchema.parse(
    await apiRequest("/carts", { token: accessToken })
  ).items
}

/** GET /carts/:restaurantId (404 when the caller has no such cart). */
export async function getCart(
  accessToken: string,
  restaurantId: string
): Promise<Cart> {
  return cartSchema.parse(
    await apiRequest(cartPath(restaurantId), { token: accessToken })
  )
}

/** POST /carts/merge: folds guest carts into the account's carts. */
export async function mergeCarts(
  accessToken: string,
  payload: MergeCartsPayload
): Promise<Cart[]> {
  return cartListSchema.parse(
    await apiRequest("/carts/merge", {
      method: "POST",
      body: payload,
      token: accessToken,
    })
  ).items
}

/** POST /carts/:restaurantId/items */
export async function addCartItem(
  accessToken: string,
  restaurantId: string,
  menuItemId: string,
  quantity: number
): Promise<Cart> {
  return cartSchema.parse(
    await apiRequest(`${cartPath(restaurantId)}/items`, {
      method: "POST",
      body: { menuItemId, quantity },
      token: accessToken,
    })
  )
}

/** PATCH /carts/:restaurantId/items/:menuItemId, sets the quantity outright. */
export async function updateCartItem(
  accessToken: string,
  restaurantId: string,
  menuItemId: string,
  quantity: number
): Promise<Cart> {
  return cartSchema.parse(
    await apiRequest(
      `${cartPath(restaurantId)}/items/${encodeURIComponent(menuItemId)}`,
      { method: "PATCH", body: { quantity }, token: accessToken }
    )
  )
}

/** DELETE /carts/:restaurantId/items/:menuItemId (an emptied cart has no lines). */
export async function removeCartItem(
  accessToken: string,
  restaurantId: string,
  menuItemId: string
): Promise<Cart> {
  return cartSchema.parse(
    await apiRequest(
      `${cartPath(restaurantId)}/items/${encodeURIComponent(menuItemId)}`,
      { method: "DELETE", token: accessToken }
    )
  )
}

/** DELETE /carts/:restaurantId */
export async function deleteCart(
  accessToken: string,
  restaurantId: string
): Promise<void> {
  await apiRequest(cartPath(restaurantId), {
    method: "DELETE",
    token: accessToken,
  })
}

/** POST /carts/:restaurantId/checkout: turns the cart into an order. */
export async function checkoutCart(
  accessToken: string,
  restaurantId: string,
  deliveryAddress: DeliveryAddress
): Promise<OrderDetail> {
  return orderDetailSchema.parse(
    await apiRequest(`${cartPath(restaurantId)}/checkout`, {
      method: "POST",
      body: { deliveryAddress },
      token: accessToken,
    })
  )
}
