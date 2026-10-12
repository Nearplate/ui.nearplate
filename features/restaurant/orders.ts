import type { OrderStatus } from "@/features/account/schemas"

export interface OrderAction {
  status: OrderStatus
  label: string
  /** `primary` moves the order forward; `danger` cancels it. */
  tone: "primary" | "danger"
}

/** What an owner can do next with an order; mirrors the API's transitions. */
const NEXT_ACTIONS: Record<OrderStatus, OrderAction[]> = {
  placed: [
    { status: "accepted", label: "Accept", tone: "primary" },
    { status: "cancelled", label: "Reject", tone: "danger" },
  ],
  accepted: [
    { status: "preparing", label: "Start cooking", tone: "primary" },
    { status: "cancelled", label: "Cancel", tone: "danger" },
  ],
  preparing: [
    { status: "out_for_delivery", label: "Send out", tone: "primary" },
    { status: "cancelled", label: "Cancel", tone: "danger" },
  ],
  out_for_delivery: [
    { status: "delivered", label: "Mark delivered", tone: "primary" },
  ],
  delivered: [],
  cancelled: [],
}

export function nextActions(status: OrderStatus): OrderAction[] {
  return NEXT_ACTIONS[status]
}

export type LaneId = "new" | "accepted" | "kitchen" | "delivery" | "done"

export interface OrderLane<TOrder> {
  id: LaneId
  title: string
  orders: TOrder[]
}

const LANES: ReadonlyArray<{
  id: LaneId
  title: string
  statuses: OrderStatus[]
}> = [
  { id: "new", title: "New", statuses: ["placed"] },
  { id: "accepted", title: "Accepted", statuses: ["accepted"] },
  { id: "kitchen", title: "In the kitchen", statuses: ["preparing"] },
  { id: "delivery", title: "Out for delivery", statuses: ["out_for_delivery"] },
  { id: "done", title: "Done", statuses: ["delivered", "cancelled"] },
]

/** Splits orders into board lanes, keeping their order within each lane. */
export function groupOrdersByLane<TOrder extends { status: OrderStatus }>(
  orders: readonly TOrder[]
): OrderLane<TOrder>[] {
  return LANES.map(({ id, title, statuses }) => ({
    id,
    title,
    orders: orders.filter((order) => statuses.includes(order.status)),
  }))
}

const MINUTE_MS = 60 * 1000
const HOUR_MS = 60 * MINUTE_MS
const DAY_MS = 24 * HOUR_MS

/** `"Just now"`, `"15 min ago"`, `"3 h ago"`, `"2 d ago"`. */
export function timeAgo(iso: string, now: Date): string {
  const elapsed = now.getTime() - new Date(iso).getTime()
  if (elapsed < MINUTE_MS) return "Just now"
  if (elapsed < HOUR_MS) return `${Math.floor(elapsed / MINUTE_MS)} min ago`
  if (elapsed < DAY_MS) return `${Math.floor(elapsed / HOUR_MS)} h ago`
  return `${Math.floor(elapsed / DAY_MS)} d ago`
}

/** Restaurants run on Indian time; "today" starts at midnight there. */
export const RESTAURANT_TIME_ZONE = "Asia/Kolkata"

const dayKey = new Intl.DateTimeFormat("en-CA", {
  timeZone: RESTAURANT_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})

export interface TodayStats {
  /** Orders placed today, cancelled ones included. */
  orders: number
  /** Today's orders still in progress. */
  live: number
  /** Revenue from today's delivered orders. */
  revenueInPaise: number
  /** Average delivered order value today. */
  averageInPaise: number
}

/** Today's numbers for the overview, from the latest page of orders. */
export function todayStats(
  orders: ReadonlyArray<{
    createdAt: string
    status: OrderStatus
    totalInPaise: number
  }>,
  now: Date
): TodayStats {
  const today = dayKey.format(now)
  const todays = orders.filter(
    (order) => dayKey.format(new Date(order.createdAt)) === today
  )
  const delivered = todays.filter((order) => order.status === "delivered")
  const revenueInPaise = delivered.reduce(
    (total, order) => total + order.totalInPaise,
    0
  )
  return {
    orders: todays.length,
    live: todays.filter(
      (order) => order.status !== "delivered" && order.status !== "cancelled"
    ).length,
    revenueInPaise,
    averageInPaise:
      delivered.length === 0
        ? 0
        : Math.round(revenueInPaise / delivered.length),
  }
}
