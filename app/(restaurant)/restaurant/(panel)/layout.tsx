import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { onboardingRedirect } from "@/features/onboarding/routing"
import { PanelSidebar } from "@/features/restaurant/components/panel-sidebar"
import {
  getMyRestaurant,
  requireRestaurantOwner,
} from "@/features/restaurant/session"

const SIDEBAR_COOKIE = "np_sidebar"

export default async function RestaurantPanelLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireRestaurantOwner()
  const restaurant = await getMyRestaurant()
  const redirectTo = onboardingRedirect(
    restaurant?.verificationStatus ?? null,
    "panel"
  )
  if (redirectTo || !restaurant) {
    redirect(redirectTo ?? "/restaurant/onboarding")
  }

  const collapsedCookie = (await cookies()).get(SIDEBAR_COOKIE)?.value
  const defaultCollapsed = collapsedCookie === "1"

  return (
    <div className="flex min-h-svh flex-col md:flex-row">
      <PanelSidebar
        restaurantName={restaurant.name}
        logoUrl={restaurant.logoUrl}
        isOnline={restaurant.status === "online"}
        defaultCollapsed={defaultCollapsed}
      />
      <main className="min-w-0 flex-1 pb-16 md:pb-0">{children}</main>
    </div>
  )
}
