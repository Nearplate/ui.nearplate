"use client"

import { useEffect, useMemo, useState } from "react"

import { Switch } from "@/components/ui/switch"
import type { MenuItem } from "@/features/restaurant/schemas"

import { useCart } from "../cart-context"
import type { MenuItemRef, RestaurantRef } from "../schemas"
import { MenuItemCard } from "./menu-item-card"

interface RestaurantMenuProps {
  restaurant: RestaurantRef & { isPureVeg: boolean }
  items: MenuItem[]
}

function categoryId(category: string): string {
  return `category-${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`
}

function toMenuItemRef(item: MenuItem): MenuItemRef {
  return {
    id: item.id,
    name: item.name,
    imageUrl: item.imageUrl,
    priceInPaise: item.priceInPaise,
    isAvailable: item.isAvailable,
  }
}

/** The public menu grouped by category, with a veg filter and category jump links. */
export function RestaurantMenu({ restaurant, items }: RestaurantMenuProps) {
  const { syncMenu } = useCart()
  const [vegOnly, setVegOnly] = useState(false)
  const { id, slug, name, status, isPureVeg } = restaurant

  // A guest cart was priced when the item was added; bring it up to date.
  useEffect(() => {
    syncMenu({ id, slug, name, status }, items.map(toMenuItemRef))
  }, [syncMenu, id, slug, name, status, items])

  const groups = useMemo(() => {
    const visible = vegOnly
      ? items.filter((item) => item.foodType === "veg")
      : items
    const byCategory = new Map<string, MenuItem[]>()
    for (const item of visible) {
      byCategory.set(item.category, [
        ...(byCategory.get(item.category) ?? []),
        item,
      ])
    }
    return [...byCategory]
  }, [items, vegOnly])

  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted">
        This restaurant hasn&apos;t added any dishes yet.
      </p>
    )
  }

  const cartRestaurant: RestaurantRef = { id, slug, name, status }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav
          aria-label="Menu categories"
          className="flex max-w-full gap-2 overflow-x-auto"
        >
          {groups.map(([category]) => (
            <a
              key={category}
              href={`#${categoryId(category)}`}
              className="shrink-0 border-2 border-inverted px-2 py-1 font-mono text-[11px] tracking-wider uppercase hover:bg-inverted hover:text-inverted"
            >
              {category}
            </a>
          ))}
        </nav>
        {isPureVeg ? null : (
          <label className="flex items-center gap-2 font-mono text-xs tracking-wider uppercase">
            <Switch checked={vegOnly} onCheckedChange={setVegOnly} />
            Veg only
          </label>
        )}
      </div>

      {groups.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">
          No vegetarian dishes on this menu.
        </p>
      ) : (
        groups.map(([category, dishes]) => (
          <section
            key={category}
            id={categoryId(category)}
            className="scroll-mt-4"
          >
            <h2 className="font-display text-2xl uppercase">{category}</h2>
            <ul className="flex flex-col">
              {dishes.map((item) => (
                <MenuItemCard
                  key={item.id}
                  restaurant={cartRestaurant}
                  item={item}
                />
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  )
}
