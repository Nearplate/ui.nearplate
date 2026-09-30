"use client"

import Link from "next/link"

import { useCart } from "../cart-context"

interface CartLinkProps {
  className?: string
}

/** Header link to the cart with the item count; hidden for accounts that cannot order. */
export function CartLink({ className }: CartLinkProps) {
  const { mode, itemCount } = useCart()
  if (mode === "disabled") return null

  return (
    <Link
      href="/cart"
      className={className}
      aria-label={`Cart, ${itemCount} ${itemCount === 1 ? "item" : "items"}`}
    >
      Cart{itemCount > 0 ? ` (${itemCount})` : ""}
    </Link>
  )
}
