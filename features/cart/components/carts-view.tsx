"use client"

import Link from "next/link"

import { Alert } from "@/components/ui/alert"
import { Button, buttonTheme } from "@/components/ui/button"
import { Card, CardBody, CardHeader } from "@/components/ui/card"
import { formatPaise } from "@/features/restaurant/money"

import { loginToCheckoutAction } from "../actions"
import { useCart } from "../cart-context"
import type { Cart } from "../schemas"
import { CartLines } from "./cart-lines"

function blockedReason(cart: Cart): string | null {
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
}

/** Checkout for a customer; a guest is sent to sign in first. */
function CheckoutControl({ cart, isGuest }: CheckoutControlProps) {
  if (!cart.canCheckout) {
    return <Button disabled>Checkout</Button>
  }
  if (isGuest) {
    return (
      <form action={loginToCheckoutAction}>
        <Button type="submit">Log in to checkout</Button>
      </form>
    )
  }
  return (
    <Link
      href={`/checkout/${cart.restaurantId}`}
      className={buttonTheme({ size: "md" })}
    >
      Checkout
    </Link>
  )
}

/** Every cart the visitor holds, one card per restaurant. */
export function CartsView() {
  const { mode, carts, clear } = useCart()

  if (mode === "disabled") {
    return (
      <p className="py-8 text-center text-sm text-muted">
        Restaurant accounts can&apos;t place orders.
      </p>
    )
  }

  if (carts.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-10">
        <p className="text-sm text-muted">Your cart is empty.</p>
        <Link href="/" className={buttonTheme({ size: "md" })}>
          Find a restaurant
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {mode === "guest" ? (
        <Alert>
          Your cart is saved on this device. Log in to check out, and it will
          come with you.
        </Alert>
      ) : null}
      {carts.map((cart) => {
        const reason = blockedReason(cart)
        return (
          <Card key={cart.restaurantId}>
            <CardHeader className="flex items-center justify-between gap-2 border-b-2 border-default">
              <Link
                href={`/r/${cart.restaurant.slug}`}
                className="font-display text-2xl uppercase hover:underline"
              >
                {cart.restaurant.name}
              </Link>
              <Button
                type="button"
                variant="ghost"
                color="neutral"
                size="sm"
                onClick={() => clear(cart.restaurantId)}
              >
                Clear
              </Button>
            </CardHeader>
            <CardBody className="flex flex-col gap-3">
              <CartLines cart={cart} editable />
              <div className="flex items-center justify-between border-t-2 border-dashed border-default pt-3 font-mono text-sm">
                <span className="tracking-wider uppercase">Subtotal</span>
                <span>{formatPaise(cart.subtotalInPaise)}</span>
              </div>
              {reason ? <Alert tone="error">{reason}</Alert> : null}
              <div className="flex justify-end">
                <CheckoutControl cart={cart} isGuest={mode === "guest"} />
              </div>
            </CardBody>
          </Card>
        )
      })}
    </div>
  )
}
