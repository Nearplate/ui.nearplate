"use client"

import { SearchIcon, XIcon } from "lucide-react"
import { useEffect, useMemo, useState, type ReactNode } from "react"

import { useCart } from "@/features/cart/cart-context"
import { FoodTypeMark } from "@/features/cart/components/food-type-mark"
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

import { filterMenu, groupMenuByCategory, type MenuFilter } from "../feed"

type FoodFilter = MenuFilter["foodType"]

const FILTER_ORDER: FoodType[] = ["veg", "non-veg", "egg"]
/** The band of the viewport that decides which category is "current". */
const SPY_ROOT_MARGIN = "-25% 0px -65% 0px"

const PILL =
  "flex shrink-0 cursor-pointer items-center gap-2 border-2 border-inverted px-3 py-1.5 font-mono text-[11px] font-medium tracking-wider uppercase transition-colors"

function categoryId(category: string): string {
  return `menu-${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`
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
        "flex gap-4 border-b-2 border-muted py-5 last:border-b-0",
        !item.isAvailable && "opacity-60"
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <FoodTypeMark foodType={item.foodType} />
        <h3 className="text-lg leading-tight font-semibold text-highlighted">
          {item.name}
        </h3>
        <p className="flex items-center gap-2 font-mono text-sm font-medium">
          {formatPaise(item.priceInPaise)}
          {item.isAvailable ? null : (
            <span className="bg-inverted px-1.5 py-0.5 text-[10px] tracking-wider text-inverted uppercase">
              Sold out
            </span>
          )}
        </p>
        {item.description ? (
          <p className="line-clamp-2 max-w-prose text-sm text-muted">
            {item.description}
          </p>
        ) : null}
      </div>
      <div className="relative flex w-28 shrink-0 flex-col items-center sm:w-32">
        {item.imageUrl ? (
          <div className="size-28 overflow-hidden border-2 border-inverted bg-elevated sm:size-32">
            <DishImage src={item.imageUrl} name={item.name} />
          </div>
        ) : null}
        <MenuItemCartControl
          restaurant={restaurant}
          item={item}
          className={cn(
            "w-24 shadow-brutal-sm",
            item.imageUrl ? "-mt-4" : "mt-auto"
          )}
        />
      </div>
    </li>
  )
}

interface MenuListProps {
  restaurant: RestaurantRef
  items: MenuItem[]
  /** Shown beside the menu from `lg` up, e.g. the restaurant's cart. */
  aside?: ReactNode
}

/**
 * The public menu: search, a food-type filter, a category index that follows
 * the scroll, and the dishes grouped by category.
 */
export function MenuList({ restaurant, items, aside }: MenuListProps) {
  const { syncMenu } = useCart()
  const [query, setQuery] = useState("")
  const [foodFilter, setFoodFilter] = useState<FoodFilter>("all")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const { id, slug, name, status } = restaurant

  // A guest cart was priced when the item was added; bring it up to date.
  useEffect(() => {
    syncMenu(
      { id, slug, name, status },
      items.map((item) => ({
        id: item.id,
        name: item.name,
        imageUrl: item.imageUrl,
        priceInPaise: item.priceInPaise,
        isAvailable: item.isAvailable,
      }))
    )
  }, [syncMenu, id, slug, name, status, items])

  const filterOptions = FILTER_ORDER.filter((type) =>
    items.some((item) => item.foodType === type)
  )
  const groups = useMemo(
    () =>
      groupMenuByCategory(filterMenu(items, { query, foodType: foodFilter })),
    [items, query, foodFilter]
  )
  const groupKey = groups.map((group) => group.category).join("|")

  // Highlight the category whose heading is in the upper band of the screen.
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return
    const sections = groupKey
      .split("|")
      .map((category) => document.getElementById(categoryId(category)))
      .filter((section): section is HTMLElement => section !== null)
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting)
        if (visible)
          setActiveCategory(visible.target.getAttribute("data-category"))
      },
      { rootMargin: SPY_ROOT_MARGIN }
    )
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [groupKey])

  if (items.length === 0) {
    return (
      <div className="m-4 border-2 border-dashed border-inverted bg-dots p-10 text-center md:m-6">
        <p className="font-display text-3xl uppercase">Menu coming soon</p>
        <p className="mt-1 text-sm text-muted">
          This kitchen hasn&apos;t added any dishes yet.
        </p>
      </div>
    )
  }

  const categoryLinks = (variant: "pill" | "list") =>
    groups.map(({ category, items: groupItems }) => {
      const active = activeCategory === category
      return (
        <a
          key={category}
          href={`#${categoryId(category)}`}
          aria-current={active ? "location" : undefined}
          className={
            variant === "pill"
              ? cn(
                  PILL,
                  active
                    ? "bg-inverted text-inverted"
                    : "hover:bg-highlight hover:text-neutral-950"
                )
              : cn(
                  "flex items-center justify-between border-l-4 px-3 py-2 font-mono text-xs font-medium tracking-wider uppercase transition-colors",
                  active
                    ? "border-highlight bg-inverted text-inverted"
                    : "border-transparent hover:bg-elevated"
                )
          }
        >
          {category}
          {variant === "list" ? (
            <span className={active ? "text-highlight" : "text-muted"}>
              {groupItems.length}
            </span>
          ) : null}
        </a>
      )
    })

  return (
    <div
      className={cn(
        "grid",
        aside
          ? "lg:grid-cols-[minmax(0,1fr)_21rem] xl:grid-cols-[13rem_minmax(0,1fr)_22rem]"
          : "xl:grid-cols-[13rem_minmax(0,1fr)]"
      )}
    >
      <div className="hidden border-r-2 border-inverted xl:block">
        <nav
          aria-label="Menu categories"
          className="sticky top-(--ui-header-height) flex max-h-[calc(100svh-var(--ui-header-height))] flex-col gap-0.5 overflow-y-auto py-4 pr-2"
        >
          <p className="px-3 pb-2 font-mono text-[10px] tracking-wider text-muted uppercase">
            On the menu
          </p>
          {categoryLinks("list")}
        </nav>
      </div>

      <div className="min-w-0">
        <div className="sticky top-(--ui-header-height) z-10 flex flex-col gap-2 border-b-2 border-inverted bg-default px-4 py-3 md:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <label className="relative min-w-48 flex-1">
              <span className="sr-only">Search this menu</span>
              <SearchIcon
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search dishes"
                className="w-full border-2 border-inverted bg-default py-1.5 pr-8 pl-9 text-sm placeholder:text-dimmed focus:shadow-brutal-sm focus:outline-none [&::-webkit-search-cancel-button]:hidden"
              />
              {query ? (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setQuery("")}
                  className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer p-0.5 hover:bg-elevated"
                >
                  <XIcon aria-hidden className="size-4" />
                </button>
              ) : null}
            </label>
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
                    PILL,
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
          </div>
          <nav
            aria-label="Jump to category"
            className="-mx-4 no-scrollbar flex gap-2 overflow-x-auto px-4 md:-mx-6 md:px-6 xl:hidden"
          >
            {categoryLinks("pill")}
          </nav>
        </div>

        <div className="flex flex-col gap-8 p-4 md:p-6">
          {groups.length === 0 ? (
            <div className="border-2 border-dashed border-inverted bg-dots p-8 text-center">
              <p className="font-display text-2xl uppercase">No dishes found</p>
              <p className="mt-1 text-sm text-muted">
                Try another search or filter.
              </p>
            </div>
          ) : null}
          {groups.map(({ category, items: groupItems }) => (
            <section
              key={category}
              id={categoryId(category)}
              data-category={category}
              className="scroll-mt-44 xl:scroll-mt-32"
            >
              <h2 className="flex items-baseline gap-3 border-b-2 border-inverted pb-2 font-display text-3xl leading-none uppercase md:text-4xl">
                {category}
                <span className="font-mono text-xs tracking-wider text-muted">
                  {groupItems.length}{" "}
                  {groupItems.length === 1 ? "dish" : "dishes"}
                </span>
              </h2>
              <ul>
                {groupItems.map((item) => (
                  <MenuRow key={item.id} restaurant={restaurant} item={item} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>

      {aside ? (
        <div className="hidden border-l-2 border-inverted lg:block">
          <div className="sticky top-(--ui-header-height) p-4">{aside}</div>
        </div>
      ) : null}
    </div>
  )
}
