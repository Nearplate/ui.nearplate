"use client"

import { PencilIcon, Trash2Icon } from "lucide-react"
import { useState, useTransition } from "react"

import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { formatPaise } from "@/features/restaurant/money"
import type { MenuItem } from "@/features/restaurant/schemas"
import { cn } from "@/lib/utils"

import { toggleMenuItemAvailabilityAction } from "../actions"
import { RemoteImage } from "./remote-image"

/** Literal class strings so Tailwind's scanner can find them. */
const FOOD_TYPE_DOT: Record<MenuItem["foodType"], string> = {
  veg: "bg-success",
  egg: "bg-warning",
  "non-veg": "bg-error",
}
const FOOD_TYPE_RING: Record<MenuItem["foodType"], string> = {
  veg: "ring-success",
  egg: "ring-warning",
  "non-veg": "ring-error",
}

interface MenuItemRowProps {
  item: MenuItem
  restaurantId: string
  onEdit: (item: MenuItem) => void
  onDelete: (item: MenuItem) => void
}

/** One dish: thumbnail, food-type mark, price, availability, edit/delete. */
export function MenuItemRow({
  item,
  restaurantId,
  onEdit,
  onDelete,
}: MenuItemRowProps) {
  const [isAvailable, setIsAvailable] = useState(item.isAvailable)
  const [isPending, startTransition] = useTransition()

  function toggle(next: boolean) {
    setIsAvailable(next)
    startTransition(async () => {
      try {
        await toggleMenuItemAvailabilityAction(restaurantId, item.id, next)
      } catch {
        setIsAvailable(!next)
      }
    })
  }

  return (
    <li className="flex items-center gap-2 border-b-2 border-muted px-2 py-1.5 last:border-b-0">
      <RemoteImage
        src={item.imageUrl}
        alt=""
        className="size-9 shrink-0 border-2 border-inverted bg-elevated"
        fallback={
          <span
            className={cn(
              "size-2.5 rounded-full",
              FOOD_TYPE_DOT[item.foodType]
            )}
            aria-hidden
          />
        }
      />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "size-2.5 shrink-0 ring-2 ring-inset",
              FOOD_TYPE_RING[item.foodType]
            )}
            aria-hidden
          >
            <span
              className={cn(
                "block size-full scale-50",
                FOOD_TYPE_DOT[item.foodType]
              )}
            />
          </span>
          <span className="truncate font-medium">{item.name}</span>
        </div>
        {item.description ? (
          <p className="line-clamp-1 text-xs text-muted">{item.description}</p>
        ) : null}
      </div>
      <Badge
        color="neutral"
        variant="soft"
        className="hidden shrink-0 sm:inline-flex"
      >
        {formatPaise(item.priceInPaise)}
      </Badge>
      <Switch
        checked={isAvailable}
        onCheckedChange={toggle}
        disabled={isPending}
        aria-label={`${item.name} available`}
      />
      <div className="flex shrink-0 gap-0.5">
        <button
          type="button"
          aria-label="Edit item"
          onClick={() => onEdit(item)}
          className="cursor-pointer p-1 hover:bg-elevated"
        >
          <PencilIcon className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Delete item"
          onClick={() => onDelete(item)}
          className="cursor-pointer p-1 hover:bg-elevated"
        >
          <Trash2Icon className="size-4" />
        </button>
      </div>
    </li>
  )
}
