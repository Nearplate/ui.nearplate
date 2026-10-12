import { ArrowDownIcon, MapPinIcon } from "lucide-react"
import Link from "next/link"

import { Button, buttonTheme } from "@/components/ui/button"
import { continueAsGuestAction } from "@/features/auth/actions"

import { ReceiptCard } from "./receipt-card"

const PROMISES = [
  { value: "0%", label: "Commission" },
  { value: "₹0", label: "Markup on menus" },
  { value: "100%", label: "To the kitchen" },
] as const

interface HomeHeroProps {
  /** The feed's area, e.g. "MG Road, Bengaluru"; null before one is set. */
  locationLabel: string | null
  showGuestAction: boolean
}

/** Landing hero: the promise, the call to action and the receipt visual. */
export function HomeHero({ locationLabel, showGuestAction }: HomeHeroProps) {
  return (
    <section className="grid border-b-2 border-inverted lg:grid-cols-[1.35fr_1fr]">
      <div className="flex flex-col justify-between gap-8 p-4 py-8 md:p-8 md:py-12">
        <div className="flex flex-col gap-5 motion-safe:animate-rise">
          <p className="inline-flex w-fit items-center gap-2 border-2 border-inverted bg-default px-2 py-1 font-mono text-[11px] font-medium tracking-wider uppercase">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60 motion-reduce:hidden" />
              <span className="relative inline-flex size-2 rounded-full bg-success" />
            </span>
            {locationLabel ? (
              <>
                <MapPinIcon aria-hidden className="size-3.5" />
                Delivering near {locationLabel}
              </>
            ) : (
              "Local kitchens, open now"
            )}
          </p>
          <h1 className="font-display text-[3.25rem] leading-[0.95] uppercase sm:text-7xl xl:text-8xl">
            Hungry?
            <br />
            Food near you.
            <br />
            <span className="mark-highlight">Zero commission.</span>
          </h1>
          <p className="max-w-md text-base text-toned">
            Order straight from the restaurants around you. They keep their
            whole margin, and you pay exactly what the menu says.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="#restaurants" className={buttonTheme({ size: "xl" })}>
              Find food near me
              <ArrowDownIcon aria-hidden />
            </Link>
            {showGuestAction ? (
              <form action={continueAsGuestAction}>
                <Button
                  type="submit"
                  size="xl"
                  variant="outline"
                  color="neutral"
                >
                  Browse as guest
                </Button>
              </form>
            ) : null}
          </div>
        </div>

        <dl className="grid max-w-lg grid-cols-3 border-2 border-inverted">
          {PROMISES.map((promise, index) => (
            <div
              key={promise.label}
              className={
                index === 0
                  ? "flex flex-col-reverse gap-1 bg-inverted p-3 text-inverted"
                  : "flex flex-col-reverse gap-1 border-l-2 border-inverted p-3"
              }
            >
              <dt className="font-mono text-[10px] tracking-wider uppercase opacity-80">
                {promise.label}
              </dt>
              <dd className="font-display text-3xl leading-none md:text-4xl">
                {promise.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="relative hidden min-h-[30rem] items-center justify-center overflow-hidden border-l-2 border-inverted bg-highlight lg:flex">
        <span
          aria-hidden
          className="absolute -top-10 -left-6 font-display text-[22rem] leading-none text-neutral-950/10 select-none"
        >
          0%
        </span>
        <div
          aria-hidden
          className="absolute right-0 bottom-0 h-1/3 w-full bg-inverted [clip-path:polygon(100%_0,100%_100%,0_100%)]"
        />
        <ReceiptCard className="relative rotate-2 motion-safe:animate-rise" />
        <span
          aria-hidden
          className="absolute top-10 right-10 grid size-24 rotate-12 place-items-center rounded-full border-2 border-inverted bg-inverted text-center font-mono text-[10px] leading-tight tracking-wider text-highlight uppercase"
        >
          Fair
          <br />
          by
          <br />
          design
        </span>
      </div>
    </section>
  )
}
