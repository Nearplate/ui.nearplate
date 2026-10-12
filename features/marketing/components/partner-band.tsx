import { ArrowUpRightIcon, CheckIcon } from "lucide-react"
import Link from "next/link"

import { buttonTheme } from "@/components/ui/button"

const PERKS = [
  "No commission on orders",
  "Your own menu page and QR code",
  "Go online or offline in one tap",
] as const

/** Call to action for restaurant owners, linking to the partner page. */
export function PartnerBand() {
  return (
    <section
      id="partners"
      className="grid scroll-mt-(--ui-header-height) border-b-2 border-inverted bg-highlight text-neutral-950 md:grid-cols-[1.4fr_1fr]"
    >
      <div className="flex flex-col gap-4 p-4 py-8 md:p-8">
        <p className="font-mono text-[11px] tracking-wider uppercase">
          Own a restaurant?
        </p>
        <h2 className="font-display text-5xl leading-[0.9] uppercase md:text-7xl">
          Keep your margin.
          <br />
          Get the orders.
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/auth?role=restaurant"
            className={buttonTheme({ size: "xl", color: "neutral" })}
          >
            List your kitchen
            <ArrowUpRightIcon aria-hidden />
          </Link>
          <Link
            href="/partners"
            className={buttonTheme({
              size: "xl",
              color: "neutral",
              variant: "outline",
              className: "bg-transparent",
            })}
          >
            How it works for you
          </Link>
        </div>
      </div>
      <ul className="flex flex-col justify-center border-t-2 border-inverted md:border-t-0 md:border-l-2">
        {PERKS.map((perk) => (
          <li
            key={perk}
            className="flex items-center gap-3 border-b-2 border-inverted p-4 font-mono text-xs font-medium tracking-wider uppercase last:border-b-0 md:px-6"
          >
            <span className="grid size-6 shrink-0 place-items-center bg-inverted text-highlight">
              <CheckIcon aria-hidden className="size-4" />
            </span>
            {perk}
          </li>
        ))}
      </ul>
    </section>
  )
}
