import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { RemoteImage } from "@/features/restaurant/components/remote-image"
import { cn } from "@/lib/utils"

import { formatDistance } from "../feed"
import type { NearbyRestaurant } from "../schemas"

interface RestaurantCardProps {
  restaurant: NearbyRestaurant
  className?: string
}

function Initial({ name, className }: { name: string; className?: string }) {
  return (
    <span className={cn("font-display uppercase", className)}>
      {name.trim().charAt(0)}
    </span>
  )
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
        <div className="aspect-video overflow-hidden border-b-2 border-inverted bg-elevated">
          <RemoteImage
            src={bannerUrl}
            alt=""
            className="size-full transition-transform duration-300 group-hover:scale-105"
            fallback={<Initial name={name} className="text-6xl text-muted" />}
          />
        </div>
        <div className="absolute -bottom-5 left-3 size-12 overflow-hidden border-2 border-inverted bg-highlight">
          <RemoteImage
            src={logoUrl}
            alt=""
            className="size-full"
            fallback={
              <Initial name={name} className="text-2xl text-neutral-950" />
            }
          />
        </div>
        <span className="absolute top-2 left-2 bg-highlight px-1.5 py-0.5 font-mono text-[10px] font-medium tracking-wider text-neutral-950 uppercase">
          Open
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3 pt-7">
        <h3 className="truncate font-display text-xl leading-none uppercase">
          {name}
        </h3>
        <p className="truncate font-mono text-[11px] tracking-wider text-muted uppercase">
          {cuisines.length > 0 ? cuisines.join(" · ") : "Local kitchen"}
        </p>
        <div className="mt-auto flex items-center gap-1.5 pt-1">
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
