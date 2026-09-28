import type { Metadata } from "next"

import { listMenuItems } from "@/features/restaurant/api/restaurant-api"
import { MenuList } from "@/features/restaurant/components/menu-list"
import { PanelHeader } from "@/features/restaurant/components/panel-header"
import { getMyRestaurant } from "@/features/restaurant/session"
import { getAccessToken } from "@/features/auth/session"

export const metadata: Metadata = { title: "Menu" }

export default async function RestaurantMenuPage() {
  const restaurant = await getMyRestaurant()
  if (!restaurant) return null

  const accessToken = await getAccessToken()
  const items = accessToken
    ? await listMenuItems(accessToken, restaurant.id)
    : []

  return (
    <div className="flex flex-col">
      <PanelHeader
        title="Menu"
        description={`${items.length} ${items.length === 1 ? "item" : "items"}`}
      />
      <MenuList restaurantId={restaurant.id} items={items} />
    </div>
  )
}
