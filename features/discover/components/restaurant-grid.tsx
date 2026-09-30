import type { NearbyRestaurant } from "../schemas"
import { RestaurantCard } from "./restaurant-card"

/** Responsive 1/2/3/4-column grid of every result. */
export function RestaurantGrid({
  restaurants,
}: {
  restaurants: NearbyRestaurant[]
}) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {restaurants.map((restaurant) => (
        <li key={restaurant.id} className="flex">
          <RestaurantCard restaurant={restaurant} className="w-full" />
        </li>
      ))}
    </ul>
  )
}
