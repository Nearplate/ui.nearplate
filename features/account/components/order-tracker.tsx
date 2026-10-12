import { CheckIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

import { ORDER_STATUS_LABELS, type OrderStatus } from "../schemas"

const FLOW: ReadonlyArray<Exclude<OrderStatus, "cancelled">> = [
  "placed",
  "accepted",
  "preparing",
  "out_for_delivery",
  "delivered",
]

export interface TrackerStep {
  status: (typeof FLOW)[number]
  state: "done" | "current" | "upcoming"
}

/** Where an order sits on the placed → delivered line. Delivered is all done. */
export function trackerSteps(
  status: Exclude<OrderStatus, "cancelled">
): TrackerStep[] {
  const index = FLOW.indexOf(status)
  return FLOW.map((step, i) => ({
    status: step,
    state:
      i < index || status === "delivered"
        ? "done"
        : i === index
          ? "current"
          : "upcoming",
  }))
}

/** A five-step progress line for an order, or a notice when it was cancelled. */
export function OrderTracker({ status }: { status: OrderStatus }) {
  if (status === "cancelled") {
    return (
      <p className="flex items-center gap-2 border-2 border-inverted bg-error/10 p-3 text-sm text-error">
        <XIcon aria-hidden className="size-4" />
        This order was cancelled.
      </p>
    )
  }

  const steps = trackerSteps(status)
  return (
    <ol className="grid grid-cols-5 border-2 border-inverted">
      {steps.map((step, index) => (
        <li
          key={step.status}
          aria-current={step.state === "current" ? "step" : undefined}
          className={cn(
            "flex flex-col gap-2 p-2 sm:p-3",
            index > 0 && "border-l-2 border-inverted",
            step.state === "done" && "bg-inverted text-inverted",
            step.state === "current" && "bg-highlight text-neutral-950"
          )}
        >
          <span
            aria-hidden
            className={cn(
              "grid size-6 place-items-center border-2 font-mono text-[10px]",
              step.state === "done"
                ? "border-highlight text-highlight"
                : "border-current"
            )}
          >
            {step.state === "done" ? (
              <CheckIcon className="size-3.5" />
            ) : (
              index + 1
            )}
          </span>
          <span className="font-mono text-[9px] leading-tight tracking-wider uppercase sm:text-[11px]">
            {ORDER_STATUS_LABELS[step.status]}
          </span>
        </li>
      ))}
    </ol>
  )
}
