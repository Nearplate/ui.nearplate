"use client"

import { ShoppingBagIcon } from "lucide-react"

import { Alert } from "@/components/ui/alert"
import { formatPaise } from "@/features/restaurant/money"

import { useCart } from "../cart-context"
import { CartLines } from "./cart-lines"
import { blockedReason, CheckoutControl } from "./checkout-control"

interface RestaurantCartPanelProps {
  restaurantId: string
  restaurantName: string
}

/**
 * The cart for the restaurant being browsed, beside its menu (desktop). Phones
 * and tablets use the floating cart bar instead.
 */
export function RestaurantCartPanel({
  restaurantId,
  restaurantName,
}: RestaurantCartPanelProps) {
  const { mode, cartFor, clear } = useCart()
  if (mode === "disabled") return null

  const cart = cartFor(restaurantId)
  const hasItems = cart !== undefined && cart.items.length > 0

  return (
    <section
      aria-label="Your order"
      className="flex flex-col overflow-hidden rounded-lg border border-default bg-default shadow-soft"
    >
      <header className="flex items-center justify-between gap-2 border-b border-inverted bg-inverted px-4 py-3 text-inverted">
        <div className="flex min-w-0 flex-col">
          <span className="font-mono text-[10px] tracking-wider text-highlight uppercase">
            Your order
          </span>
          <span className="truncate font-display text-xl tracking-tight">
            {restaurantName}
          </span>
        </div>
        {hasItems ? (
          <button
            type="button"
            onClick={() => clear(restaurantId)}
            className="shrink-0 cursor-pointer font-mono text-[11px] tracking-wider uppercase underline-offset-2 hover:underline"
          >
            Clear
          </button>
        ) : null}
      </header>

      {hasItems ? (
        <div className="flex flex-col gap-3 p-4">
          <CartLines cart={cart} editable />
          <dl className="flex flex-col gap-1 border-t border-dashed border-default pt-3 font-mono text-xs tracking-wider uppercase">
            <div className="flex justify-between">
              <dt className="text-muted">Commission</dt>
              <dd>₹0.00</dd>
            </div>
            <div className="flex items-end justify-between">
              <dt>Subtotal</dt>
              <dd className="font-display text-2xl leading-none tracking-normal tracking-tight">
                {formatPaise(cart.subtotalInPaise)}
              </dd>
            </div>
          </dl>
          {blockedReason(cart) ? (
            <Alert tone="error">{blockedReason(cart)}</Alert>
          ) : null}
          <CheckoutControl cart={cart} isGuest={mode === "guest"} block />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 bg-dots px-4 py-10 text-center">
          <span className="grid size-12 place-items-center rounded-lg border border-default bg-highlight text-highlighted">
            <ShoppingBagIcon aria-hidden className="size-6" />
          </span>
          <p className="font-display text-2xl tracking-tight">
            Your plate is empty
          </p>
          <p className="max-w-56 text-xs text-muted">
            Add a dish from the menu and it shows up here.
          </p>
        </div>
      )}
    </section>
  )
}
