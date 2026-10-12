import { ChevronRightIcon } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { buttonTheme } from "@/components/ui/button"
import { formatPaise } from "@/features/restaurant/money"
import { cn } from "@/lib/utils"

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

const ACTIVE_STATUSES: ReadonlyArray<OrderSummary["status"]> = [
  "placed",
  "accepted",
  "preparing",
  "out_for_delivery",
]

/** Rows: restaurant initial, name, date, status and total; live orders flagged. */
export function OrderList({ orders }: OrderListProps) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 border-2 border-dashed border-inverted bg-dots px-4 py-10 text-center">
        <p className="font-display text-2xl uppercase">No orders yet</p>
        <p className="text-sm text-muted">
          Your first plate is a few taps away.
        </p>
        <Link href="/#restaurants" className={buttonTheme({ size: "sm" })}>
          Find a restaurant
        </Link>
      </div>
    )
  }

  return (
    <ul className="flex flex-col gap-2">
      {orders.map((order) => {
        const isLive = ACTIVE_STATUSES.includes(order.status)
        return (
          <li key={order.id}>
            <Link
              href={`/account/orders/${order.id}`}
              className="group flex items-center gap-3 border-2 border-inverted bg-default p-3 transition-[transform,box-shadow] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal"
            >
              <span
                aria-hidden
                className={cn(
                  "grid size-10 shrink-0 place-items-center border-2 border-inverted font-display text-xl",
                  isLive ? "bg-highlight text-neutral-950" : "bg-elevated"
                )}
              >
                {order.restaurantName.charAt(0).toUpperCase()}
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate font-semibold">
                  {order.restaurantName}
                </span>
                <span className="font-mono text-[11px] text-muted">
                  {new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </span>
              <Badge
                color={STATUS_COLOR[order.status]}
                variant={isLive ? "solid" : "soft"}
                className="gap-1.5"
              >
                {isLive ? (
                  <span
                    aria-hidden
                    className="size-1.5 animate-pulse rounded-full bg-highlight"
                  />
                ) : null}
                {ORDER_STATUS_LABELS[order.status]}
              </Badge>
              <span className="w-20 shrink-0 text-right font-mono text-sm font-medium">
                {formatPaise(order.totalInPaise)}
              </span>
              <ChevronRightIcon
                aria-hidden
                className="size-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
