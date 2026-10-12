import { MapPinIcon, PercentIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  RestaurantBanner,
  RestaurantLogo,
} from "@/features/restaurant/components/remote-image"
import { ShareButton } from "@/features/restaurant/components/share-button"
import type { Restaurant } from "@/features/restaurant/schemas"

/** Banner, logo, name and facts at the top of the public restaurant page. */
export function RestaurantHero({ restaurant }: { restaurant: Restaurant }) {
  const { name, cuisines, isPureVeg, description, address, status } = restaurant
  const isClosed = status === "offline"

  return (
    <header className="border-b-2 border-inverted">
      <div className="h-40 overflow-hidden border-b-2 border-inverted bg-elevated md:h-60">
        <RestaurantBanner src={restaurant.bannerUrl} name={name} />
      </div>
      <div className="grid gap-4 p-4 md:grid-cols-[auto_1fr_auto] md:items-end md:gap-6 md:p-6">
        <div className="relative -mt-16 size-24 shrink-0 overflow-hidden border-2 border-inverted bg-elevated shadow-brutal md:-mt-20 md:size-32">
          <RestaurantLogo
            src={restaurant.logoUrl}
            name={name}
            className="text-5xl md:text-6xl"
          />
        </div>
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {isClosed ? (
              <Badge color="error" size="lg">
                Closed now
              </Badge>
            ) : (
              <Badge
                color="neutral"
                size="lg"
                className="gap-1.5 bg-highlight text-neutral-950"
              >
                <span
                  aria-hidden
                  className="size-1.5 rounded-full bg-neutral-950"
                />
                Open now
              </Badge>
            )}
            {isPureVeg ? (
              <Badge color="success" variant="subtle" size="lg">
                Pure veg
              </Badge>
            ) : null}
          </div>
          <h1 className="font-display text-5xl leading-[0.9] uppercase md:text-7xl">
            {name}
          </h1>
          {cuisines.length > 0 ? (
            <p className="font-mono text-xs tracking-wider text-muted uppercase">
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
        <div className="flex flex-wrap items-center gap-2 md:flex-col md:items-end">
          <ShareButton
            title={name}
            url={`/r/${restaurant.slug}`}
            variant="outline"
            color="neutral"
            size="md"
          />
          <p className="inline-flex items-center gap-1.5 border-2 border-inverted bg-inverted px-2 py-1 font-mono text-[10px] tracking-wider text-inverted uppercase">
            <PercentIcon aria-hidden className="size-3 text-highlight" />
            Menu prices, no markup
          </p>
        </div>
      </div>
    </header>
  )
}
