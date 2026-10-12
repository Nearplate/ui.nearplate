"use client"

import { ShoppingBagIcon } from "lucide-react"
import Link from "next/link"

import { cn } from "@/lib/utils"

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
      className={cn("gap-2", className)}
      aria-label={`Cart, ${itemCount} ${itemCount === 1 ? "item" : "items"}`}
    >
      <ShoppingBagIcon aria-hidden className="size-4" />
      <span className="max-sm:sr-only">Cart</span>
      {itemCount > 0 ? (
        <span
          aria-hidden
          className="grid min-w-5 place-items-center bg-highlight px-1 text-[10px] leading-5 text-neutral-950"
        >
          {itemCount}
        </span>
      ) : null}
    </Link>
  )
}
