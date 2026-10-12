import { formatPaise } from "@/features/restaurant/money"
import { cn } from "@/lib/utils"

const LINES = [
  { name: "Paneer butter masala", quantity: 1, priceInPaise: 28900 },
  { name: "Garlic naan", quantity: 2, priceInPaise: 6900 },
  { name: "Masala chaas", quantity: 1, priceInPaise: 5900 },
] as const

const TOTAL_IN_PAISE = LINES.reduce(
  (total, line) => total + line.quantity * line.priceInPaise,
  0
)

/** Decorative receipt that spells out the pitch: menu price in, menu price out. */
export function ReceiptCard({ className }: { className?: string }) {
  return (
    <figure
      aria-label="Example order: you pay the menu price, the restaurant keeps all of it"
      className={cn(
        "flex w-72 flex-col gap-3 border-2 border-inverted bg-default p-4 font-mono text-[11px] tracking-wider text-default uppercase shadow-brutal-lg",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-display text-xl tracking-normal">Your order</span>
        <span className="text-muted">#NP-0427</span>
      </div>
      <ul className="flex flex-col gap-1.5 border-y-2 border-dashed border-inverted py-3">
        {LINES.map((line) => (
          <li key={line.name} className="flex justify-between gap-3">
            <span className="truncate">
              {line.quantity} × {line.name}
            </span>
            <span>{formatPaise(line.quantity * line.priceInPaise)}</span>
          </li>
        ))}
      </ul>
      <dl className="flex flex-col gap-1.5">
        <div className="flex justify-between">
          <dt className="text-muted">Platform markup</dt>
          <dd>₹0.00</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Restaurant commission</dt>
          <dd className="bg-highlight px-1 text-neutral-950">₹0.00</dd>
        </div>
        <div className="mt-1 flex items-end justify-between border-t-2 border-inverted pt-2">
          <dt>You pay</dt>
          <dd className="font-display text-3xl leading-none tracking-normal">
            {formatPaise(TOTAL_IN_PAISE)}
          </dd>
        </div>
      </dl>
      <figcaption className="text-center text-muted">
        ✱ 100% goes to the kitchen ✱
      </figcaption>
    </figure>
  )
}
