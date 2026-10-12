"use client"

import { ShoppingBagIcon } from "lucide-react"
import Link from "next/link"

import { Alert } from "@/components/ui/alert"
import { Button, buttonTheme } from "@/components/ui/button"
import { Card, CardBody, CardHeader } from "@/components/ui/card"
import { formatPaise } from "@/features/restaurant/money"

import { useCart } from "../cart-context"
import { CartLines } from "./cart-lines"
import { blockedReason, CheckoutControl } from "./checkout-control"

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
      <div className="flex flex-col items-center gap-3 border-2 border-dashed border-inverted bg-dots px-4 py-16 text-center">
        <span className="grid size-14 place-items-center border-2 border-inverted bg-highlight text-neutral-950 shadow-brutal">
          <ShoppingBagIcon aria-hidden className="size-7" />
        </span>
        <p className="font-display text-4xl uppercase">Your cart is empty</p>
        <p className="max-w-xs text-sm text-muted">
          Find a kitchen near you and add a dish or two.
        </p>
        <Link href="/#restaurants" className={buttonTheme({ size: "lg" })}>
          Find a restaurant
        </Link>
      </div>
    )
  }

  const itemCount = carts.reduce((total, cart) => total + cart.itemCount, 0)
  const subtotal = carts.reduce(
    (total, cart) => total + cart.subtotalInPaise,
    0
  )

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="flex min-w-0 flex-col gap-4">
        {mode === "guest" ? (
          <Alert>
            Your cart is saved on this device. Log in to check out, and it will
            come with you.
          </Alert>
        ) : null}
        {carts.map((cart) => {
          const reason = blockedReason(cart)
          return (
            <Card key={cart.restaurantId} className="shadow-brutal">
              <CardHeader className="flex items-center justify-between gap-2 border-b-2 border-default bg-inverted text-inverted">
                <Link
                  href={`/r/${cart.restaurant.slug}`}
                  className="font-display text-2xl uppercase hover:text-highlight"
                >
                  {cart.restaurant.name}
                </Link>
                <Button
                  type="button"
                  variant="link"
                  color="neutral"
                  size="sm"
                  className="text-inverted hover:text-highlight"
                  onClick={() => clear(cart.restaurantId)}
                >
                  Clear
                </Button>
              </CardHeader>
              <CardBody className="flex flex-col gap-3">
                <CartLines cart={cart} editable />
                <div className="flex items-end justify-between border-t-2 border-dashed border-default pt-3 font-mono text-sm">
                  <span className="tracking-wider uppercase">Subtotal</span>
                  <span className="font-display text-2xl leading-none">
                    {formatPaise(cart.subtotalInPaise)}
                  </span>
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

      <aside className="flex flex-col gap-3 self-start border-2 border-inverted bg-highlight p-4 text-neutral-950 lg:sticky lg:top-[calc(var(--ui-header-height)+1.5rem)]">
        <p className="font-mono text-[11px] tracking-wider uppercase">
          {carts.length} {carts.length === 1 ? "restaurant" : "restaurants"} ·{" "}
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </p>
        <p className="font-display text-5xl leading-none">
          {formatPaise(subtotal)}
        </p>
        <p className="text-sm">
          Each restaurant checks out separately. You pay the menu price, with no
          commission or markup on any dish.
        </p>
      </aside>
    </div>
  )
}
