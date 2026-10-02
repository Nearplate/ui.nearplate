"use client"

import { useState } from "react"

import { MenuItemCartControl } from "@/features/cart/components/menu-item-cart-control"
import type { RestaurantRef } from "@/features/cart/schemas"
import { DishImage } from "@/features/restaurant/components/remote-image"
import { formatPaise } from "@/features/restaurant/money"
import {
  FOOD_TYPE_LABELS,
  type FoodType,
  type MenuItem,
} from "@/features/restaurant/schemas"
import { cn } from "@/lib/utils"

import { groupMenuByCategory } from "../feed"

const FOOD_TYPE_DOT: Record<FoodType, string> = {
  veg: "border-success text-success",
  egg: "border-warning text-warning",
  "non-veg": "border-error text-error",
}

type FoodFilter = "all" | FoodType

const FILTER_ORDER: FoodType[] = ["veg", "non-veg", "egg"]

function categoryId(category: string): string {
  return `menu-${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`
}

function FoodTypeMark({ foodType }: { foodType: FoodType }) {
  return (
    <span
      role="img"
      aria-label={FOOD_TYPE_LABELS[foodType]}
      className={cn(
        "grid size-4 shrink-0 place-items-center border-2",
        FOOD_TYPE_DOT[foodType]
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
    </span>
  )
}

function MenuRow({
  restaurant,
  item,
}: {
  restaurant: RestaurantRef
  item: MenuItem
}) {
  return (
    <li
      className={cn(
        "flex gap-3 border-2 border-inverted p-3",
        !item.isAvailable && "opacity-60"
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <FoodTypeMark foodType={item.foodType} />
          <h3 className="truncate font-mono text-sm font-medium tracking-wider uppercase">
            {item.name}
          </h3>
        </div>
        {item.description ? (
          <p className="line-clamp-2 text-sm text-toned">{item.description}</p>
        ) : null}
        <p className="mt-auto flex items-center gap-2 pt-1 font-mono text-sm">
          {formatPaise(item.priceInPaise)}
          {item.isAvailable ? null : (
            <span className="bg-inverted px-1.5 py-0.5 text-[10px] tracking-wider text-inverted uppercase">
              Sold out
            </span>
          )}
        </p>
      </div>
      <div className="flex w-24 shrink-0 flex-col justify-between gap-2">
        <div className="size-24 overflow-hidden border-2 border-inverted bg-elevated">
          <DishImage src={item.imageUrl} name={item.name} />
        </div>
        <MenuItemCartControl
          restaurant={restaurant}
          item={item}
          className="w-full"
        />
      </div>
    </li>
  )
}

/** The public menu: a sticky category jump-row, then items grouped by category. */
export function MenuList({
  restaurant,
  items,
}: {
  restaurant: RestaurantRef
  items: MenuItem[]
}) {
  const [foodFilter, setFoodFilter] = useState<FoodFilter>("all")
  const filterOptions = FILTER_ORDER.filter(
    (type) => type !== "egg" || items.some((item) => item.foodType === "egg")
  )
  const visibleItems =
    foodFilter === "all"
      ? items
      : items.filter((item) => item.foodType === foodFilter)
  const groups = groupMenuByCategory(visibleItems)

  if (items.length === 0) {
    return (
      <p className="p-4 py-10 font-mono text-sm tracking-wider text-muted uppercase">
        This menu is empty for now.
      </p>
    )
  }

  return (
    <div>
      <div className="sticky top-0 z-10 flex items-center gap-2 overflow-x-auto border-b-2 border-inverted bg-default p-3">
        <div
          role="group"
          aria-label="Filter by food type"
          className="flex shrink-0 gap-2"
        >
          {(["all", ...filterOptions] as FoodFilter[]).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={foodFilter === option}
              onClick={() => setFoodFilter(option)}
              className={cn(
                "flex shrink-0 items-center gap-2 border-2 border-inverted px-3 py-1 font-mono text-[11px] font-medium tracking-wider uppercase",
                foodFilter === option
                  ? "bg-inverted text-inverted"
                  : "hover:bg-highlight hover:text-neutral-950"
              )}
            >
              {option === "all" ? (
                "All"
              ) : (
                <>
                  <FoodTypeMark foodType={option} />
                  {FOOD_TYPE_LABELS[option]}
                </>
              )}
            </button>
          ))}
        </div>
        <span aria-hidden className="h-6 w-0.5 shrink-0 bg-inverted" />
        <nav aria-label="Menu categories" className="flex shrink-0 gap-2">
          {groups.map(({ category }) => (
            <a
              key={category}
              href={`#${categoryId(category)}`}
              className="shrink-0 border-2 border-inverted px-3 py-1 font-mono text-[11px] font-medium tracking-wider uppercase hover:bg-highlight hover:text-neutral-950"
            >
              {category}
            </a>
          ))}
        </nav>
      </div>
      <div className="flex flex-col gap-6 p-4">
        {groups.length === 0 ? (
          <p className="py-6 font-mono text-sm tracking-wider text-muted uppercase">
            No items match this filter.
          </p>
        ) : null}
        {groups.map(({ category, items: groupItems }) => (
          <section
            key={category}
            id={categoryId(category)}
            className="scroll-mt-16"
          >
            <h2 className="mb-3 font-display text-3xl leading-none uppercase">
              {category}
            </h2>
            <ul className="grid gap-3 md:grid-cols-2">
              {groupItems.map((item) => (
                <MenuRow key={item.id} restaurant={restaurant} item={item} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
