"use client"

import { ArrowRightIcon, ShoppingBagIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { formatPaise } from "@/features/restaurant/money"

import { useCart } from "../cart-context"
import type { Cart } from "../schemas"

/** Pages that already are the cart; the bar would only get in the way. */
const HIDDEN_PATH_PREFIXES = ["/cart", "/checkout"] as const

interface CartSummary {
  title: string
  itemCount: number
  subtotalInPaise: number
}

/** What the bar shows: the restaurant for one cart, a count for several. */
export function summarizeCarts(carts: Cart[]): CartSummary {
  return {
    title:
      carts.length === 1
        ? carts[0].restaurant.name
        : `${carts.length} restaurants`,
    itemCount: carts.reduce((total, cart) => total + cart.itemCount, 0),
    subtotalInPaise: carts.reduce(
      (total, cart) => total + cart.subtotalInPaise,
      0
    ),
  }
}

/**
 * Bottom-of-screen cart summary for phones and tablets, shown once the cart
 * has something in it. Desktop keeps the cart link in the header.
 */
export function FloatingCart() {
  const { mode, carts } = useCart()
  const pathname = usePathname()

  const hidden = HIDDEN_PATH_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  )
  if (mode === "disabled" || carts.length === 0 || hidden) return null

  const { title, itemCount, subtotalInPaise } = summarizeCarts(carts)
  const summary = `${itemCount} ${itemCount === 1 ? "item" : "items"} · ${formatPaise(subtotalInPaise)}`

  return (
    <>
      {/* Keeps the footer clear of the fixed bar at the end of the page. */}
      <div aria-hidden className="h-24 lg:hidden" />
      <Link
        href="/cart"
        aria-label={`View cart, ${summary}`}
        className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] z-30 mx-auto flex max-w-xl items-center gap-3 border-2 border-inverted bg-default p-2 shadow-[4px_4px_0_var(--ui-border)] motion-safe:transition-transform lg:hidden motion-safe:starting:translate-y-[150%]"
      >
        <span className="flex size-10 shrink-0 items-center justify-center border-2 border-inverted bg-highlight">
          <ShoppingBagIcon aria-hidden className="size-5" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-display text-lg leading-tight tracking-tight uppercase">
            {title}
          </span>
          <span className="font-mono text-[11px] tracking-wider uppercase">
            {summary}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-1.5 pr-1 font-mono text-[11px] font-medium tracking-wider uppercase">
          View cart
          <ArrowRightIcon aria-hidden className="size-3.5" />
        </span>
      </Link>
    </>
  )
}
