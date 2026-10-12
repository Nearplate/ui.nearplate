import { ApiError } from "@/lib/api/client"

import { listNearby } from "../api/discover-api"
import { buildFeed, featuredRails } from "../feed"
import type { FeedFilters } from "../location"
import type { FeedLocation } from "../schemas"
import { CategoryRail } from "./category-rail"
import { FeedEmpty } from "./feed-empty"
import { LocationBar } from "./location-bar"
import { RestaurantGrid } from "./restaurant-grid"
import { RestaurantRail } from "./restaurant-rail"

interface HomeFeedProps {
  location: FeedLocation
  filters: FeedFilters
}

/** The discover feed for one location: category chips, featured rails, results grid. */
export async function HomeFeed({ location, filters }: HomeFeedProps) {
  const { lng, lat } = location
  const isFiltered = Boolean(filters.cuisine) || filters.veg

  let all, results
  try {
    // Chips always come from the unfiltered result so they don't collapse
    // to the active cuisine.
    ;[all, results] = await Promise.all([
      listNearby({ lng, lat }),
      isFiltered
        ? listNearby({
            lng,
            lat,
            cuisine: filters.cuisine,
            isPureVeg: filters.veg,
          })
        : undefined,
    ])
  } catch (error) {
    if (!(error instanceof ApiError)) throw error
    return (
      <>
        <LocationBar label={location.label} openCount={null} />
        <FeedEmpty
          title="Can't load restaurants"
          description="Something went wrong on our side. Please try again in a moment."
        />
      </>
    )
  }

  const feed = buildFeed(all, new Date())
  const rails = isFiltered ? [] : featuredRails(feed, all.length)
  const shown = results ?? all

  return (
    <>
      <div className="sticky top-(--ui-header-height) z-20 bg-default">
        <LocationBar label={location.label} openCount={all.length} />
        <CategoryRail cuisines={feed.cuisines} filters={filters} />
      </div>

      {rails.map((rail) => (
        <RestaurantRail
          key={rail.key}
          title={rail.title}
          restaurants={rail.restaurants}
          seeAllHref={rail.seeAllHref}
        />
      ))}

      <section
        id="restaurants"
        className="scroll-mt-40 border-b border-default"
      >
        <div className="flex flex-wrap items-end justify-between gap-2 px-4 pt-6 md:px-6">
          <h2 className="font-display text-4xl leading-none font-light tracking-tight md:text-5xl">
            {filters.cuisine
              ? `${filters.cuisine} near you`
              : filters.veg
                ? "Pure veg near you"
                : "Open now near you"}
          </h2>
          <p className="font-mono text-[11px] tracking-wider text-muted uppercase">
            {shown.length} {shown.length === 1 ? "kitchen" : "kitchens"} ·
            nearest first
          </p>
        </div>
        {shown.length === 0 ? (
          <FeedEmpty
            title="Nothing open here yet"
            description={
              isFiltered
                ? "No open restaurants match this filter nearby."
                : "No restaurants are open within 10 km. Try another area."
            }
            showReset={isFiltered}
          />
        ) : (
          <div className="p-4 md:p-6">
            <RestaurantGrid restaurants={shown} />
          </div>
        )}
      </section>
    </>
  )
}
