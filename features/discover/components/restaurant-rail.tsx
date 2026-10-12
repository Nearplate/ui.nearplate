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
    <section className="flex flex-col gap-3 border-b border-default px-4 py-5 md:px-6">
      <div className="flex items-end justify-between gap-2">
        <h2 className="font-display text-3xl leading-none font-light tracking-tight md:text-4xl">
          {title}
        </h2>
        {seeAllHref ? (
          <Link
            href={seeAllHref}
            scroll={false}
            className="inline-flex items-center gap-1 rounded-lg border border-inverted px-2 py-1 font-mono text-[11px] font-medium tracking-wider uppercase hover:bg-inverted hover:text-inverted"
          >
            See all
            <ArrowUpRightIcon aria-hidden className="size-3.5" />
          </Link>
        ) : null}
      </div>
      <div className="-mx-4 no-scrollbar flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pt-1 pr-5 pb-2 md:-mx-6 md:scroll-px-6 md:px-6">
        {restaurants.map((restaurant) => (
          <RestaurantCard
            key={restaurant.id}
            restaurant={restaurant}
            className="w-64 shrink-0 snap-start"
          />
        ))}
      </div>
    </section>
  )
}
