"use client"

import { Badge } from "@/components/ui/badge"
import { RemoteImage } from "@/features/restaurant/components/remote-image"
import { formatPaise } from "@/features/restaurant/money"
import type { MenuItem } from "@/features/restaurant/schemas"
import { cn } from "@/lib/utils"

import type { RestaurantRef } from "../schemas"
import { FoodTypeMark } from "./food-type-mark"
import { MenuItemCartControl } from "./menu-item-cart-control"

interface MenuItemCardProps {
  restaurant: RestaurantRef
  item: MenuItem
}

/** One dish on the public menu, with add-to-cart controls when ordering is possible. */
export function MenuItemCard({ restaurant, item }: MenuItemCardProps) {
  return (
    <li className="flex gap-3 border-b-2 border-muted py-3 last:border-b-0">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <FoodTypeMark foodType={item.foodType} />
          <span
            className={cn("font-medium", !item.isAvailable && "text-muted")}
          >
            {item.name}
          </span>
          {item.isAvailable ? null : (
            <Badge color="neutral" variant="soft" size="sm">
              Sold out
            </Badge>
          )}
        </div>
        <span className="font-mono text-sm">
          {formatPaise(item.priceInPaise)}
        </span>
        {item.description ? (
          <p className="line-clamp-2 text-xs text-muted">{item.description}</p>
        ) : null}
      </div>
      <div className="flex shrink-0 flex-col items-center gap-2">
        <RemoteImage
          src={item.imageUrl}
          alt={item.name}
          className="size-20 border-2 border-inverted bg-elevated"
          fallback={<FoodTypeMark foodType={item.foodType} />}
        />
        <MenuItemCartControl restaurant={restaurant} item={item} />
      </div>
    </li>
  )
}
