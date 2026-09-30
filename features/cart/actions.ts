"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { z } from "zod"

import { listAddresses } from "@/features/account/api/address-api"
import {
  RETURN_TO_COOKIE,
  returnToCookieOptions,
} from "@/features/auth/session-cookies"
import { getAccessToken } from "@/features/auth/session"
import { ApiError } from "@/lib/api/client"
import { errorMessage } from "@/lib/api/error-message"

import {
  addCartItem,
  checkoutCart,
  deleteCart,
  mergeCarts,
  removeCartItem,
  updateCartItem,
} from "./api/cart-api"
import { MAX_ITEM_QUANTITY } from "./constants"
import type { Cart } from "./schemas"

const HTTP_CONFLICT = 409
const INVALID_REQUEST = "Check your details and try again."

/** `cart` is null once the cart no longer exists (its last line went). */
export type CartActionResult =
  { status: "ok"; cart: Cart | null } | { status: "error"; message: string }

export type MergeActionResult =
  { status: "ok"; carts: Cart[] } | { status: "error"; message: string }

export type CheckoutActionResult =
  { status: "ok"; orderId: string } | { status: "error"; message: string }

type Outcome<T> =
  { status: "ok"; value: T } | { status: "error"; message: string }

const idSchema = z.uuid()
const quantitySchema = z.number().int().min(1).max(MAX_ITEM_QUANTITY)
const mergePayloadSchema = z.object({
  carts: z.array(
    z.object({
      restaurantId: idSchema,
      items: z.array(
        z.object({ menuItemId: idSchema, quantity: quantitySchema })
      ),
    })
  ),
})

function cartErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === HTTP_CONFLICT) {
    return "This restaurant or item isn't available right now."
  }
  return errorMessage(error)
}

/** Runs an API call with the caller's access token, mapping API failures to text. */
async function authed<T>(
  run: (accessToken: string) => Promise<T>
): Promise<Outcome<T>> {
  const accessToken = await getAccessToken()
  if (!accessToken) {
    return { status: "error", message: "Sign in to use your cart." }
  }
  try {
    return { status: "ok", value: await run(accessToken) }
  } catch (error) {
    return { status: "error", message: cartErrorMessage(error) }
  }
}

function toCartResult(outcome: Outcome<Cart>): CartActionResult {
  if (outcome.status === "error") return outcome
  return {
    status: "ok",
    cart: outcome.value.items.length > 0 ? outcome.value : null,
  }
}

function invalid(): { status: "error"; message: string } {
  return { status: "error", message: INVALID_REQUEST }
}

/** Adds one of a menu item, creating the cart if needed. */
export async function addToCartAction(
  restaurantId: string,
  menuItemId: string
): Promise<CartActionResult> {
  if (
    !idSchema.safeParse(restaurantId).success ||
    !idSchema.safeParse(menuItemId).success
  ) {
    return invalid()
  }
  return toCartResult(
    await authed((token) => addCartItem(token, restaurantId, menuItemId, 1))
  )
}

/** Sets a line's quantity outright (1 to the per-line maximum). */
export async function setCartItemQuantityAction(
  restaurantId: string,
  menuItemId: string,
  quantity: number
): Promise<CartActionResult> {
  if (
    !idSchema.safeParse(restaurantId).success ||
    !idSchema.safeParse(menuItemId).success ||
    !quantitySchema.safeParse(quantity).success
  ) {
    return invalid()
  }
  return toCartResult(
    await authed((token) =>
      updateCartItem(token, restaurantId, menuItemId, quantity)
    )
  )
}

/** Removes a line; the cart goes with its last line. */
export async function removeCartItemAction(
  restaurantId: string,
  menuItemId: string
): Promise<CartActionResult> {
  if (
    !idSchema.safeParse(restaurantId).success ||
    !idSchema.safeParse(menuItemId).success
  ) {
    return invalid()
  }
  return toCartResult(
    await authed((token) => removeCartItem(token, restaurantId, menuItemId))
  )
}

/** Deletes one restaurant's cart. */
export async function clearCartAction(
  restaurantId: string
): Promise<CartActionResult> {
  if (!idSchema.safeParse(restaurantId).success) return invalid()

  const outcome = await authed((token) => deleteCart(token, restaurantId))
  return outcome.status === "error" ? outcome : { status: "ok", cart: null }
}

/** Folds the browser's guest carts into the account on sign-in. */
export async function mergeGuestCartsAction(
  payload: unknown
): Promise<MergeActionResult> {
  const parsed = mergePayloadSchema.safeParse(payload)
  if (!parsed.success) return invalid()

  const outcome = await authed((token) => mergeCarts(token, parsed.data))
  return outcome.status === "error"
    ? outcome
    : { status: "ok", carts: outcome.value }
}

/**
 * Turns a cart into an order, delivered to one of the caller's saved
 * addresses. The address is looked up here, so the client never supplies
 * address fields.
 */
export async function checkoutAction(
  restaurantId: string,
  addressId: string
): Promise<CheckoutActionResult> {
  if (
    !idSchema.safeParse(restaurantId).success ||
    !idSchema.safeParse(addressId).success
  ) {
    return invalid()
  }

  const outcome = await authed(async (token) => {
    const address = (await listAddresses(token)).find(
      (entry) => entry.id === addressId
    )
    if (!address) return null
    return checkoutCart(token, restaurantId, {
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      state: address.state,
      zipcode: address.zipcode,
      phoneNumber: address.phoneNumber,
      label: address.label,
    })
  })
  if (outcome.status === "error") return outcome
  if (!outcome.value) {
    return { status: "error", message: "Choose a delivery address." }
  }

  revalidatePath("/account")
  return { status: "ok", orderId: outcome.value.id }
}

/**
 * A guest chose to check out: remember to bring them back to the cart, then
 * send them to sign in. Their guest cart is merged in when the cart page loads.
 */
export async function loginToCheckoutAction(): Promise<void> {
  ;(await cookies()).set(RETURN_TO_COOKIE, "/cart", returnToCookieOptions())
  redirect("/auth")
}
