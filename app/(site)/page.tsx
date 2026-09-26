import { ArrowUpRightIcon, CheckIcon } from "lucide-react"
import Link from "next/link"

import { BentoCell, BentoGrid, BentoTitle } from "@/components/layout/bento"
import { Button, buttonTheme } from "@/components/ui/button"
import { continueAsGuestAction } from "@/features/auth/actions"
import { getSession } from "@/features/auth/session"

const STEPS = ["Find a kitchen", "Pick your meal", "Place the order", "Eat"]
const PERKS = ["Browse nearby menus", "Order in a few taps", "Pay your way"]

export default async function HomePage() {
  const user = await getSession()

  return (
    <>
      <section className="grid border-b-2 border-inverted md:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col justify-center gap-4 p-4 md:p-8">
          <h1 className="font-display text-6xl leading-[0.9] uppercase md:text-8xl">
            Hungry?
            <br />
            Food near you.
            <br />
            Zero commission.
          </h1>
          <p className="max-w-md text-sm text-toned">
            Order straight from local restaurants. They keep their margin, you
            pay menu price.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={user ? "/account" : "/auth"}
              className={buttonTheme({ size: "lg" })}
            >
              {user ? "Your account" : "Order now"}
              <ArrowUpRightIcon aria-hidden />
            </Link>
            {user ? null : (
              <form action={continueAsGuestAction}>
                <Button
                  type="submit"
                  size="lg"
                  variant="outline"
                  color="neutral"
                >
                  Browse as guest
                </Button>
              </form>
            )}
          </div>
        </div>

        <div
          aria-hidden
          className="relative hidden min-h-64 overflow-hidden border-l-2 border-inverted bg-highlight md:block"
        >
          <span className="absolute top-2 left-6 font-display text-[16rem] leading-none text-neutral-950">
            N
          </span>
          <div className="absolute right-0 bottom-0 h-1/3 w-full bg-inverted [clip-path:polygon(100%_0,100%_100%,0_100%)]" />
        </div>
      </section>

      <BentoGrid>
        <BentoCell id="restaurants">
          <BentoTitle>Local restaurants</BentoTitle>
          <p className="text-sm text-toned">
            Independent kitchens in your area. No chains required.
          </p>
        </BentoCell>

        <BentoCell>
          <BentoTitle>Zero commission</BentoTitle>
          <p className="text-sm text-toned">
            Restaurants keep every rupee of the menu price. Fair for them,
            honest for you.
          </p>
        </BentoCell>

        <BentoCell tone="highlight">
          <BentoTitle>Fair by design</BentoTitle>
          <p className="font-display text-7xl leading-none">0%</p>
          <p className="font-mono text-[11px] tracking-wider uppercase">
            Commission taken from restaurants.
          </p>
        </BentoCell>

        <BentoCell tone="dark">
          <BentoTitle>Simple ordering</BentoTitle>
          <ul className="flex flex-col gap-1.5 text-sm">
            {PERKS.map((perk) => (
              <li key={perk} className="flex items-center gap-2">
                <CheckIcon aria-hidden className="size-4 text-highlight" />
                {perk}
              </li>
            ))}
          </ul>
        </BentoCell>

        <BentoCell id="how">
          <BentoTitle>How it works</BentoTitle>
          <ol className="flex flex-col gap-1.5 text-sm">
            {STEPS.map((step, index) => (
              <li key={step} className="flex items-center gap-2">
                <span className="grid size-5 place-items-center border-2 border-inverted font-mono text-[10px]">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </BentoCell>

        <BentoCell id="partners">
          <BentoTitle>Own a restaurant?</BentoTitle>
          <p className="text-sm text-toned">
            Get orders without giving away your margin.
          </p>
          <Link
            href="/auth?role=restaurant"
            className={buttonTheme({ size: "sm", className: "self-start" })}
          >
            Partner with us
            <ArrowUpRightIcon aria-hidden />
          </Link>
        </BentoCell>
      </BentoGrid>
    </>
  )
}
