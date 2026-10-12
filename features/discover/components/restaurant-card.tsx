import { ArrowUpRightIcon, NavigationIcon } from "lucide-react"
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
        "group flex lift flex-col border-2 border-inverted bg-default focus-visible:outline-none",
        className
      )}
    >
      <div className="relative">
        <div className="aspect-[16/9] overflow-hidden border-b-2 border-inverted bg-elevated">
          <RestaurantBanner
            src={bannerUrl}
            name={name}
            className="transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="absolute -bottom-5 left-3 size-12 overflow-hidden border-2 border-inverted bg-elevated shadow-brutal-sm">
          <RestaurantLogo src={logoUrl} name={name} className="text-2xl" />
        </div>
        <span className="absolute top-2 left-2 inline-flex items-center gap-1 border-2 border-inverted bg-highlight px-1.5 py-0.5 font-mono text-[10px] font-medium tracking-wider text-neutral-950 uppercase">
          <span aria-hidden className="size-1.5 rounded-full bg-neutral-950" />
          Open
        </span>
        <span
          aria-hidden
          className="absolute top-2 right-2 grid size-7 translate-y-1 place-items-center border-2 border-inverted bg-inverted text-highlight opacity-0 transition-[opacity,transform] group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
        >
          <ArrowUpRightIcon className="size-4" />
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3 pt-7">
        <h3 className="truncate font-display text-2xl leading-none uppercase">
          {name}
        </h3>
        <p className="truncate font-mono text-[11px] tracking-wider text-muted uppercase">
          {cuisines.length > 0 ? cuisines.join(" · ") : "Local kitchen"}
        </p>
        <div className="mt-auto flex items-center gap-1.5 pt-1.5">
          <span className="inline-flex items-center gap-1 font-mono text-[11px] font-medium tracking-wider uppercase">
            <NavigationIcon aria-hidden className="size-3 rotate-45" />
            {formatDistance(restaurant.distanceMeters)}
          </span>
          {isPureVeg ? (
            <Badge
              color="success"
              variant="subtle"
              size="sm"
              className="ml-auto"
            >
              Pure veg
            </Badge>
          ) : null}
        </div>
      </div>
    </Link>
  )
}
