import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { formatPaise } from "@/features/restaurant/money"

import { ORDER_STATUS_LABELS, type OrderSummary } from "../schemas"

export const STATUS_COLOR: Record<
  OrderSummary["status"],
  "neutral" | "success" | "error"
> = {
  placed: "neutral",
  accepted: "neutral",
  preparing: "neutral",
  out_for_delivery: "neutral",
  delivered: "success",
  cancelled: "error",
}

interface OrderListProps {
  orders: OrderSummary[]
}

/** Compact rows: restaurant, date, status and total. */
export function OrderList({ orders }: OrderListProps) {
  if (orders.length === 0) {
    return <p className="py-6 text-center text-sm text-muted">No orders yet.</p>
  }

  return (
    <ul className="flex flex-col">
      {orders.map((order) => (
        <li
          key={order.id}
          className="flex items-center gap-2 border-b-2 border-muted py-2 last:border-b-0"
        >
          <Link
            href={`/account/orders/${order.id}`}
            className="flex min-w-0 flex-1 flex-col gap-0.5 hover:underline"
          >
            <span className="truncate font-medium">{order.restaurantName}</span>
            <span className="font-mono text-[11px] text-muted">
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </Link>
          <Badge color={STATUS_COLOR[order.status]} variant="soft">
            {ORDER_STATUS_LABELS[order.status]}
          </Badge>
          <span className="shrink-0 font-mono text-sm">
            {formatPaise(order.totalInPaise)}
          </span>
        </li>
      ))}
    </ul>
  )
}
