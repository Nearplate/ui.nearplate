import { MapPinIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { RemoteImage } from "@/features/restaurant/components/remote-image"
import type { Restaurant } from "@/features/restaurant/schemas"

/** Banner, logo, name and facts at the top of the public restaurant page. */
export function RestaurantHero({ restaurant }: { restaurant: Restaurant }) {
  const { name, cuisines, isPureVeg, description, address, status } = restaurant
  const isClosed = status === "offline"
  const initial = name.trim().charAt(0)

  return (
    <header className="border-b-2 border-inverted">
      <div className="h-40 overflow-hidden border-b-2 border-inverted bg-elevated md:h-56">
        <RemoteImage
          src={restaurant.bannerUrl}
          alt=""
          className="size-full"
          fallback={
            <span className="font-display text-9xl text-muted uppercase">
              {initial}
            </span>
          }
        />
      </div>
      <div className="flex flex-col gap-3 p-4 md:flex-row md:items-start md:gap-5">
        <div className="-mt-12 size-20 shrink-0 overflow-hidden border-2 border-inverted bg-highlight md:mt-0 md:size-24">
          <RemoteImage
            src={restaurant.logoUrl}
            alt={`${name} logo`}
            className="size-full"
            fallback={
              <span className="font-display text-4xl text-neutral-950 uppercase">
                {initial}
              </span>
            }
          />
        </div>
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-5xl leading-none uppercase md:text-6xl">
              {name}
            </h1>
            {isClosed ? (
              <Badge color="error" size="lg">
                Closed now
              </Badge>
            ) : null}
            {isPureVeg ? (
              <Badge color="success" variant="soft" size="lg">
                Pure veg
              </Badge>
            ) : null}
          </div>
          {cuisines.length > 0 ? (
            <p className="font-mono text-[11px] tracking-wider text-muted uppercase">
              {cuisines.join(" · ")}
            </p>
          ) : null}
          {description ? (
            <p className="max-w-xl text-sm text-toned">{description}</p>
          ) : null}
          <p className="flex items-center gap-1.5 text-sm text-toned">
            <MapPinIcon aria-hidden className="size-4 shrink-0" />
            {address.line1}, {address.city}
          </p>
        </div>
      </div>
    </header>
  )
}
