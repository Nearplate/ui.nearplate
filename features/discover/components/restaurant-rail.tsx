import { ArrowUpRightIcon } from "lucide-react"
import Link from "next/link"

import type { NearbyRestaurant } from "../schemas"
import { RestaurantCard } from "./restaurant-card"

interface RestaurantRailProps {
  title: string
  restaurants: NearbyRestaurant[]
  /** Where "See all" goes; omitted for rails with no filtered view. */
  seeAllHref?: string
}

/** A titled, horizontally scrolling row of restaurant cards. */
export function RestaurantRail({
  title,
  restaurants,
  seeAllHref,
}: RestaurantRailProps) {
  if (restaurants.length === 0) return null

  return (
    <section className="flex flex-col gap-2.5 border-b-2 border-inverted px-4 py-3">
      <div className="flex items-end justify-between gap-2">
        <h2 className="font-display text-2xl leading-none uppercase md:text-3xl">
          {title}
        </h2>
        {seeAllHref ? (
          <Link
            href={seeAllHref}
            scroll={false}
            className="inline-flex items-center gap-1 font-mono text-[11px] tracking-wider uppercase hover:underline"
          >
            See all
            <ArrowUpRightIcon aria-hidden className="size-3.5" />
          </Link>
        ) : null}
      </div>
      <div className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pr-5 pb-1">
        {restaurants.map((restaurant) => (
          <RestaurantCard
            key={restaurant.id}
            restaurant={restaurant}
            className="w-56 shrink-0 snap-start"
          />
        ))}
      </div>
    </section>
  )
}
