"use client"

import { MapPinIcon, PhoneIcon, RefreshCwIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import { ORDER_STATUS_LABELS } from "@/features/account/schemas"
import { notifyError } from "@/lib/toast"
import { cn } from "@/lib/utils"

import { updateOrderStatusAction } from "../actions"
import type { OwnerOrder } from "../api/order-api"
import { formatPaise } from "../money"
import { groupOrdersByLane, nextActions, timeAgo, type LaneId } from "../orders"

/** How often the board re-reads orders while the tab is visible. */
const REFRESH_INTERVAL_MS = 30_000
/** Finished orders kept on the board; older ones are history. */
const DONE_LIMIT = 12
const SHORT_ID_LENGTH = 8

const LANE_ACCENT: Record<LaneId, string> = {
  new: "bg-highlight text-neutral-950",
  accepted: "bg-inverted text-inverted",
  kitchen: "bg-inverted text-inverted",
  delivery: "bg-inverted text-inverted",
  done: "bg-elevated text-default",
}

function OrderCard({
  restaurantId,
  order,
  now,
}: {
  restaurantId: string
  order: OwnerOrder
  now: Date
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const actions = nextActions(order.status)
  const { deliveryAddress: address } = order

  function advance(status: OwnerOrder["status"]) {
    startTransition(async () => {
      const result = await updateOrderStatusAction(
        restaurantId,
        order.id,
        status
      )
      if (!result.ok) notifyError(result.message, "Couldn't update the order")
      router.refresh()
    })
  }

  return (
    <li
      className={cn(
        "flex flex-col gap-3 border-2 border-inverted bg-default p-3 shadow-brutal-sm",
        order.status === "placed" && "shadow-[3px_3px_0_var(--ui-highlight)]",
        isPending && "opacity-60"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col">
          <span className="font-mono text-xs font-medium tracking-wider uppercase">
            #{order.id.slice(0, SHORT_ID_LENGTH)}
          </span>
          <time
            dateTime={order.createdAt}
            className="font-mono text-[10px] tracking-wider text-muted uppercase"
          >
            {timeAgo(order.createdAt, now)}
          </time>
        </div>
        <span className="font-display text-2xl leading-none">
          {formatPaise(order.totalInPaise)}
        </span>
      </div>
      <div className="flex flex-col gap-1 border-t-2 border-dashed border-muted pt-2 text-xs">
        <span className="flex items-start gap-1.5">
          <MapPinIcon aria-hidden className="mt-0.5 size-3.5 shrink-0" />
          <span>
            {address.label ? (
              <span className="font-semibold">{address.label} · </span>
            ) : null}
            {address.line1}, {address.city}
          </span>
        </span>
        {address.phoneNumber ? (
          <a
            href={`tel:${address.phoneNumber}`}
            className="flex items-center gap-1.5 font-mono hover:underline"
          >
            <PhoneIcon aria-hidden className="size-3.5 shrink-0" />
            {address.phoneNumber}
          </a>
        ) : null}
      </div>
      {actions.length > 0 ? (
        <div className="flex gap-2">
          {actions.map((action) => (
            <Button
              key={action.status}
              type="button"
              size="sm"
              color={action.tone === "danger" ? "error" : "primary"}
              variant={action.tone === "danger" ? "ghost" : "solid"}
              className={action.tone === "primary" ? "flex-1" : undefined}
              disabled={isPending}
              onClick={() => advance(action.status)}
            >
              {action.label}
            </Button>
          ))}
        </div>
      ) : (
        <span
          className={cn(
            "self-start px-1.5 py-0.5 font-mono text-[10px] tracking-wider uppercase",
            order.status === "delivered"
              ? "bg-success/10 text-success"
              : "bg-error/10 text-error"
          )}
        >
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      )}
    </li>
  )
}

interface OrdersBoardProps {
  restaurantId: string
  orders: OwnerOrder[]
}

/**
 * Incoming orders as a board, one lane per stage. Each card moves to the next
 * stage in one tap, and the board re-reads orders every 30 seconds.
 */
export function OrdersBoard({ restaurantId, orders }: OrdersBoardProps) {
  const router = useRouter()
  const [now, setNow] = useState(() => new Date())
  const [isRefreshing, startRefresh] = useTransition()

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState !== "visible") return
      setNow(new Date())
      startRefresh(() => router.refresh())
    }, REFRESH_INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [router])

  const lanes = groupOrdersByLane(orders).map((lane) =>
    lane.id === "done"
      ? { ...lane, orders: lane.orders.slice(0, DONE_LIMIT) }
      : lane
  )

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2 px-4 md:px-6">
        <p className="flex items-center gap-2 font-mono text-[11px] tracking-wider text-muted uppercase">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60 motion-reduce:hidden" />
            <span className="relative inline-flex size-2 rounded-full bg-success" />
          </span>
          Live · refreshes every 30 s
        </p>
        <Button
          type="button"
          variant="outline"
          color="neutral"
          size="sm"
          loading={isRefreshing}
          onClick={() => {
            setNow(new Date())
            startRefresh(() => router.refresh())
          }}
        >
          {isRefreshing ? null : <RefreshCwIcon aria-hidden />}
          Refresh
        </Button>
      </div>
      <div className="no-scrollbar flex snap-x gap-4 overflow-x-auto px-4 pb-6 md:px-6 xl:grid xl:grid-cols-5 xl:overflow-visible">
        {lanes.map((lane) => (
          <section
            key={lane.id}
            aria-labelledby={`lane-${lane.id}`}
            className="flex w-72 shrink-0 snap-start flex-col border-2 border-inverted bg-muted xl:w-auto"
          >
            <h2
              id={`lane-${lane.id}`}
              className={cn(
                "flex items-center justify-between border-b-2 border-inverted px-3 py-2 font-mono text-xs font-medium tracking-wider uppercase",
                LANE_ACCENT[lane.id]
              )}
            >
              {lane.title}
              <span className="grid min-w-6 place-items-center border-2 border-current px-1 text-[10px]">
                {lane.orders.length}
              </span>
            </h2>
            {lane.orders.length === 0 ? (
              <p className="m-3 border-2 border-dashed border-muted p-4 text-center font-mono text-[10px] tracking-wider text-muted uppercase">
                Nothing here
              </p>
            ) : (
              <ul className="flex flex-col gap-3 p-3">
                {lane.orders.map((order) => (
                  <OrderCard
                    key={order.id}
                    restaurantId={restaurantId}
                    order={order}
                    now={now}
                  />
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  )
}
