import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { RemoteImage } from "@/features/restaurant/components/remote-image"
import { ShareButton } from "@/features/restaurant/components/share-button"
import type { Restaurant } from "@/features/restaurant/schemas"

interface RestaurantHeroProps {
  restaurant: Restaurant
}

/** Banner, name, cuisines and share link at the top of a public restaurant page. */
export function RestaurantHero({ restaurant }: RestaurantHeroProps) {
  const { address } = restaurant

  return (
    <header className="border-b-2 border-inverted">
      <RemoteImage
        src={restaurant.bannerUrl}
        alt=""
        className="h-36 w-full border-b-2 border-inverted bg-elevated md:h-52"
        fallback={
          <span className="font-display text-4xl text-muted uppercase">
            {restaurant.name}
          </span>
        }
      />
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 p-4 md:p-6">
        <div className="flex items-start gap-3">
          <RemoteImage
            src={restaurant.logoUrl}
            alt={`${restaurant.name} logo`}
            className="size-16 shrink-0 border-2 border-inverted bg-elevated"
            fallback={
              <span className="font-display text-2xl uppercase">
                {restaurant.name.charAt(0)}
              </span>
            }
          />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h1 className="font-display text-4xl leading-none uppercase">
              {restaurant.name}
            </h1>
            <p className="text-xs text-muted">
              {address.line1}, {address.city}
            </p>
          </div>
          <ShareButton
            title={restaurant.name}
            url={`/r/${restaurant.slug}`}
            variant="outline"
            color="neutral"
            size="sm"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {restaurant.isPureVeg ? (
            <Badge color="success" variant="soft">
              Pure veg
            </Badge>
          ) : null}
          {restaurant.cuisines.map((cuisine) => (
            <Badge key={cuisine} color="neutral" variant="soft">
              {cuisine}
            </Badge>
          ))}
        </div>

        {restaurant.description ? (
          <p className="text-sm text-toned">{restaurant.description}</p>
        ) : null}

        {restaurant.status === "online" ? null : (
          <Alert>
            This restaurant isn&apos;t taking orders right now. You can still
            browse the menu.
          </Alert>
        )}
      </div>
    </header>
  )
}
