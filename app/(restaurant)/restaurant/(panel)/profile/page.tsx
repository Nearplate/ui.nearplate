import type { Metadata } from "next"

import { PanelHeader } from "@/features/restaurant/components/panel-header"
import { RestaurantProfileForm } from "@/features/restaurant/components/restaurant-profile-form"
import { getMyRestaurant } from "@/features/restaurant/session"

export const metadata: Metadata = { title: "Profile" }

export default async function RestaurantProfilePage() {
  const restaurant = await getMyRestaurant()
  if (!restaurant) return null

  return (
    <div className="flex flex-col">
      <PanelHeader
        title="Profile"
        description="Update how diners see your restaurant."
      />
      <div className="mx-auto w-full max-w-xl p-3 md:p-4">
        <RestaurantProfileForm restaurant={restaurant} />
      </div>
    </div>
  )
}
