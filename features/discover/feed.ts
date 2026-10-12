import type { FoodType, MenuItem } from "@/features/restaurant/schemas"

import type { NearbyRestaurant } from "./schemas"

export const NEW_WINDOW_DAYS = 30
export const RAIL_SIZE = 8
export const TOP_CUISINES = 12
export const CUISINE_RAILS = 2

const MS_PER_DAY = 24 * 60 * 60 * 1000
const METERS_PER_KM = 1000
const MIN_DISTANCE_METERS = 10

export interface CuisineRail {
  cuisine: string
  restaurants: NearbyRestaurant[]
}

export interface Feed {
  closest: NearbyRestaurant[]
  fresh: NearbyRestaurant[]
  pureVeg: NearbyRestaurant[]
  cuisineRails: CuisineRail[]
  /** Cuisines nearby, most served first (the category chips). */
  cuisines: string[]
}

export interface FeaturedRail {
  key: string
  title: string
  restaurants: NearbyRestaurant[]
  /** The filtered feed behind "See all", when there is one. */
  seeAllHref?: string
}

/** A rail needs at least this many restaurants to be worth a row. */
export const MIN_RAIL_SIZE = 2

export interface MenuGroup {
  category: string
  items: MenuItem[]
}

/** `850` -> `"850 m"`, `2432` -> `"2.4 km"`. */
export function formatDistance(meters: number): string {
  if (meters >= METERS_PER_KM) {
    return `${(meters / METERS_PER_KM).toFixed(1)} km`
  }
  return `${Math.max(MIN_DISTANCE_METERS, Math.round(meters))} m`
}

/** Cuisines ordered by how many restaurants serve them (ties keep first-seen order). */
export function rankCuisines(
  restaurants: readonly NearbyRestaurant[],
  limit: number
): string[] {
  const counts = new Map<string, number>()
  for (const { cuisines } of restaurants) {
    for (const cuisine of cuisines) {
      counts.set(cuisine, (counts.get(cuisine) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([cuisine]) => cuisine)
}

/** Derives every featured rail from one nearest-first nearby result. */
export function buildFeed(
  restaurants: readonly NearbyRestaurant[],
  now: Date
): Feed {
  const cutoff = now.getTime() - NEW_WINDOW_DAYS * MS_PER_DAY
  const cuisines = rankCuisines(restaurants, TOP_CUISINES)

  return {
    closest: restaurants.slice(0, RAIL_SIZE),
    fresh: restaurants
      .filter((r) => new Date(r.createdAt).getTime() >= cutoff)
      .slice(0, RAIL_SIZE),
    pureVeg: restaurants.filter((r) => r.isPureVeg).slice(0, RAIL_SIZE),
    cuisineRails: cuisines.slice(0, CUISINE_RAILS).map((cuisine) => ({
      cuisine,
      restaurants: restaurants
        .filter((r) => r.cuisines.includes(cuisine))
        .slice(0, RAIL_SIZE),
    })),
    cuisines,
  }
}

function idsOf(restaurants: readonly NearbyRestaurant[]): string {
  return restaurants.map((restaurant) => restaurant.id).join(",")
}

/**
 * The rails worth showing above the results grid. A rail is dropped when it
 * is nearly empty, when it holds every result (it would repeat the grid), or
 * when an earlier rail already shows the same restaurants.
 */
export function featuredRails(feed: Feed, total: number): FeaturedRail[] {
  const candidates: FeaturedRail[] = [
    { key: "closest", title: "Closest to you", restaurants: feed.closest },
    { key: "fresh", title: "New on NearPlate", restaurants: feed.fresh },
    {
      key: "veg",
      title: "Pure veg picks",
      restaurants: feed.pureVeg,
      seeAllHref: "/?veg=1",
    },
    ...feed.cuisineRails.map(({ cuisine, restaurants }) => ({
      key: `cuisine-${cuisine}`,
      title: `Best of ${cuisine}`,
      restaurants,
      seeAllHref: `/?cuisine=${encodeURIComponent(cuisine)}`,
    })),
  ]

  const seen = new Set<string>()
  return candidates.filter(({ restaurants }) => {
    const ids = idsOf(restaurants)
    const keep =
      restaurants.length >= MIN_RAIL_SIZE &&
      restaurants.length < total &&
      !seen.has(ids)
    if (keep) seen.add(ids)
    return keep
  })
}

/** Groups a menu by category, keeping the order categories first appear in. */
export function groupMenuByCategory(items: readonly MenuItem[]): MenuGroup[] {
  const groups = new Map<string, MenuItem[]>()
  for (const item of items) {
    groups.set(item.category, [...(groups.get(item.category) ?? []), item])
  }
  return [...groups.entries()].map(([category, grouped]) => ({
    category,
    items: grouped,
  }))
}

export interface MenuFilter {
  /** Free text matched against dish names and descriptions. */
  query: string
  foodType: "all" | FoodType
}

/** The dishes matching a search and a veg / egg / non-veg filter. */
export function filterMenu(
  items: readonly MenuItem[],
  { query, foodType }: MenuFilter
): MenuItem[] {
  const needle = query.trim().toLowerCase()
  return items.filter((item) => {
    if (foodType !== "all" && item.foodType !== foodType) return false
    if (!needle) return true
    return (
      item.name.toLowerCase().includes(needle) ||
      (item.description?.toLowerCase().includes(needle) ?? false)
    )
  })
}
