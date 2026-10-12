import type { Metadata } from "next"

import { getAccessToken } from "@/features/auth/session"
import { listRestaurantOrders } from "@/features/restaurant/api/order-api"
import { OrdersBoard } from "@/features/restaurant/components/orders-board"
import { PanelHeader } from "@/features/restaurant/components/panel-header"
import { getMyRestaurant } from "@/features/restaurant/session"

export const metadata: Metadata = { title: "Orders" }

export default async function RestaurantOrdersPage() {
  const restaurant = await getMyRestaurant()
  if (!restaurant) return null

  const accessToken = await getAccessToken()
  const orders = accessToken
    ? await listRestaurantOrders(accessToken, restaurant.id)
    : []
  const liveCount = orders.filter(
    (order) => order.status !== "delivered" && order.status !== "cancelled"
  ).length

  return (
    <div className="flex flex-col gap-4">
      <PanelHeader
        title="Orders"
        description={
          liveCount === 0
            ? "No live orders right now"
            : `${liveCount} live ${liveCount === 1 ? "order" : "orders"}`
        }
      />
      <OrdersBoard restaurantId={restaurant.id} orders={orders} />
    </div>
  )
}
