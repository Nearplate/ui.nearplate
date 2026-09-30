"use client"

import Link from "next/link"

import { buttonTheme } from "@/components/ui/button"
import { formatPaise } from "@/features/restaurant/money"

import { useCart } from "../cart-context"

interface CartBarProps {
  restaurantId: string
}

/** Sticky summary of this restaurant's cart, shown once it has something in it. */
export function CartBar({ restaurantId }: CartBarProps) {
  const { cartFor } = useCart()
  const cart = cartFor(restaurantId)
  if (!cart) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t-2 border-inverted bg-default">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 p-3">
        <span className="font-mono text-xs tracking-wider uppercase">
          {cart.itemCount} {cart.itemCount === 1 ? "item" : "items"} ·{" "}
          {formatPaise(cart.subtotalInPaise)}
        </span>
        <Link href="/cart" className={buttonTheme({ size: "md" })}>
          View cart
        </Link>
      </div>
    </div>
  )
}
