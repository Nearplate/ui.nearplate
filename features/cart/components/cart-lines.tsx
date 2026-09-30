"use client"

import { Badge } from "@/components/ui/badge"
import { formatPaise } from "@/features/restaurant/money"

import { useCart } from "../cart-context"
import { MAX_ITEM_QUANTITY } from "../constants"
import type { Cart } from "../schemas"
import { QuantityStepper } from "./quantity-stepper"

interface CartLinesProps {
  cart: Cart
  /** Show quantity controls; otherwise a fixed "×n" (checkout summary). */
  editable: boolean
}

/** The lines of one cart with price, quantity and line total. */
export function CartLines({ cart, editable }: CartLinesProps) {
  const { setItemQuantity } = useCart()

  return (
    <ul className="flex flex-col">
      {cart.items.map((line) => (
        <li
          key={line.menuItemId}
          className="flex items-center gap-3 border-b-2 border-muted py-2 last:border-b-0"
        >
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate font-medium">{line.name}</span>
            <span className="font-mono text-[11px] text-muted">
              {formatPaise(line.priceInPaise)} each
            </span>
            {line.isAvailable ? null : (
              <Badge color="error" variant="soft" size="sm" className="w-fit">
                Unavailable
              </Badge>
            )}
          </div>
          {editable ? (
            <QuantityStepper
              quantity={line.quantity}
              itemName={line.name}
              onIncrement={() =>
                setItemQuantity(
                  cart.restaurantId,
                  line.menuItemId,
                  line.quantity + 1
                )
              }
              onDecrement={() =>
                setItemQuantity(
                  cart.restaurantId,
                  line.menuItemId,
                  line.quantity - 1
                )
              }
              incrementDisabled={
                !line.isAvailable || line.quantity >= MAX_ITEM_QUANTITY
              }
            />
          ) : (
            <span className="font-mono text-xs">×{line.quantity}</span>
          )}
          <span className="w-20 shrink-0 text-right font-mono text-sm">
            {formatPaise(line.lineTotalInPaise)}
          </span>
        </li>
      ))}
    </ul>
  )
}
