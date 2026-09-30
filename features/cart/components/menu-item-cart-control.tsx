"use client"

import type { MenuItem } from "@/features/restaurant/schemas"

import { useCart } from "../cart-context"
import { MAX_ITEM_QUANTITY } from "../constants"
import type { RestaurantRef } from "../schemas"
import { QuantityStepper } from "./quantity-stepper"

interface MenuItemCartControlProps {
  restaurant: RestaurantRef
  item: MenuItem
}

/** The "Add" button for a dish, which becomes a quantity stepper once it is in the cart. */
export function MenuItemCartControl({
  restaurant,
  item,
}: MenuItemCartControlProps) {
  const { mode, quantityOf, add, setItemQuantity } = useCart()
  const quantity = quantityOf(restaurant.id, item.id)
  const isOrderable = restaurant.status === "online" && item.isAvailable
  // A line already in the cart stays adjustable even if it sold out since.
  const showStepper = mode !== "disabled" && (isOrderable || quantity > 0)

  if (!showStepper) return null

  return (
    <QuantityStepper
      quantity={quantity}
      itemName={item.name}
      onIncrement={() =>
        add(restaurant, {
          id: item.id,
          name: item.name,
          imageUrl: item.imageUrl,
          priceInPaise: item.priceInPaise,
          isAvailable: item.isAvailable,
        })
      }
      onDecrement={() => setItemQuantity(restaurant.id, item.id, quantity - 1)}
      incrementDisabled={!isOrderable || quantity >= MAX_ITEM_QUANTITY}
    />
  )
}
