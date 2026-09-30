import { ApiError } from "@/lib/api/client"

import { listNearby } from "../api/discover-api"
import { buildFeed } from "../feed"
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

function cuisineHref(cuisine: string): string {
  return `/?cuisine=${encodeURIComponent(cuisine)}`
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
  const shown = results ?? all

  return (
    <>
      <LocationBar label={location.label} openCount={all.length} />
      <CategoryRail cuisines={feed.cuisines} filters={filters} />

      {isFiltered ? null : (
        <>
          <RestaurantRail title="Closest to you" restaurants={feed.closest} />
          <RestaurantRail title="New on NearPlate" restaurants={feed.fresh} />
          <RestaurantRail
            title="Pure veg picks"
            restaurants={feed.pureVeg}
            seeAllHref="/?veg=1"
          />
          {feed.cuisineRails.map(({ cuisine, restaurants }) => (
            <RestaurantRail
              key={cuisine}
              title={`Best of ${cuisine}`}
              restaurants={restaurants}
              seeAllHref={cuisineHref(cuisine)}
            />
          ))}
        </>
      )}

      <section
        id="restaurants"
        className="scroll-mt-4 border-b-2 border-inverted"
      >
        <h2 className="px-4 pt-4 font-display text-3xl leading-none uppercase md:text-4xl">
          {filters.cuisine
            ? `${filters.cuisine} near you`
            : filters.veg
              ? "Pure veg near you"
              : "Open now near you"}
        </h2>
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
          <div className="p-4">
            <RestaurantGrid restaurants={shown} />
          </div>
        )}
      </section>
    </>
  )
}
