import { ArrowUpRightIcon } from "lucide-react"
import Link from "next/link"

import { BentoTitle } from "@/components/layout/bento"

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
    <section className="flex flex-col gap-3 border-b-2 border-inverted p-4">
      <div className="flex items-baseline justify-between gap-2">
        <BentoTitle>{title}</BentoTitle>
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
      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
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
