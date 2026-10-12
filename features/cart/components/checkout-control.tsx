"use client"

import Link from "next/link"

import { Button, buttonTheme } from "@/components/ui/button"

import { loginToCheckoutAction } from "../actions"
import type { Cart } from "../schemas"

/** Why a cart cannot be checked out yet, or null when it can. */
export function blockedReason(cart: Cart): string | null {
  if (cart.restaurant.status !== "online") {
    return "This restaurant isn't taking orders right now."
  }
  if (cart.items.some((line) => !line.isAvailable)) {
    return "Some items are unavailable. Remove them to continue."
  }
  return null
}

interface CheckoutControlProps {
  cart: Cart
  isGuest: boolean
  /** Stretch to the container's width (the restaurant page's cart panel). */
  block?: boolean
}

/** Checkout for a customer; a guest is sent to sign in first. */
export function CheckoutControl({
  cart,
  isGuest,
  block = false,
}: CheckoutControlProps) {
  if (!cart.canCheckout) {
    return (
      <Button disabled block={block}>
        Checkout
      </Button>
    )
  }
  if (isGuest) {
    return (
      <form action={loginToCheckoutAction}>
        <Button type="submit" block={block}>
          Log in to checkout
        </Button>
      </form>
    )
  }
  return (
    <Link
      href={`/checkout/${cart.restaurantId}`}
      className={buttonTheme({ size: "md", block })}
    >
      Checkout
    </Link>
  )
}
