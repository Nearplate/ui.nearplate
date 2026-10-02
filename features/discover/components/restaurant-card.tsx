import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import {
  RestaurantBanner,
  RestaurantLogo,
} from "@/features/restaurant/components/remote-image"
import { cn } from "@/lib/utils"

import { formatDistance } from "../feed"
import type { NearbyRestaurant } from "../schemas"

interface RestaurantCardProps {
  restaurant: NearbyRestaurant
  className?: string
}

/** A discover-feed card: banner, overlapping logo, cuisines, distance. */
export function RestaurantCard({ restaurant, className }: RestaurantCardProps) {
  const { name, slug, cuisines, isPureVeg, bannerUrl, logoUrl } = restaurant

  return (
    <Link
      href={`/r/${slug}`}
      className={cn(
        "group flex flex-col border-2 border-inverted bg-default transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--ui-border)] focus-visible:-translate-x-0.5 focus-visible:-translate-y-0.5 focus-visible:shadow-[4px_4px_0_var(--ui-border)] focus-visible:outline-none",
        className
      )}
    >
      <div className="relative">
        <div className="aspect-[2/1] overflow-hidden border-b-2 border-inverted bg-elevated">
          <RestaurantBanner
            src={bannerUrl}
            name={name}
            className="transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="absolute -bottom-4 left-2.5 size-10 overflow-hidden border-2 border-inverted bg-elevated">
          <RestaurantLogo src={logoUrl} name={name} className="text-xl" />
        </div>
        <span className="absolute top-1.5 left-1.5 bg-highlight px-1.5 py-0.5 font-mono text-[10px] font-medium tracking-wider text-neutral-950 uppercase">
          Open
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-2.5 pt-6">
        <h3 className="truncate font-display text-xl leading-none uppercase">
          {name}
        </h3>
        <p className="truncate font-mono text-[11px] tracking-wider text-muted uppercase">
          {cuisines.length > 0 ? cuisines.join(" · ") : "Local kitchen"}
        </p>
        <div className="mt-auto flex items-center gap-1.5 pt-0.5">
          <Badge color="neutral" variant="outline" size="sm">
            {formatDistance(restaurant.distanceMeters)}
          </Badge>
          {isPureVeg ? (
            <Badge color="success" variant="soft" size="sm">
              Pure veg
            </Badge>
          ) : null}
        </div>
      </div>
    </Link>
  )
}
