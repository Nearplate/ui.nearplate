import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { siteConfig } from "@/config/site"
import { RestaurantOnboardingForm } from "@/features/restaurant/components/restaurant-onboarding-form"
import {
  getMyRestaurant,
  requireRestaurantOwner,
} from "@/features/restaurant/session"

export const metadata: Metadata = { title: "Set up your restaurant" }

const STEPS = ["You", "Restaurant", "Location", "Brand"] as const

export default async function RestaurantOnboardingPage() {
  const user = await requireRestaurantOwner()
  const restaurant = await getMyRestaurant()
  if (restaurant) redirect("/restaurant")

  return (
    <main className="grid min-h-svh lg:grid-cols-2">
      <aside className="hidden flex-col justify-between border-r-2 border-inverted bg-inverted p-6 text-inverted lg:flex">
        <Link
          href="/"
          className="font-display text-3xl tracking-tight uppercase"
        >
          {siteConfig.name}
        </Link>
        <div className="flex flex-col gap-4">
          <p className="font-display text-5xl leading-none uppercase">
            Put your
            <br />
            kitchen on
            <br />
            <span className="bg-highlight px-2 text-neutral-950">the map.</span>
          </p>
          <ol className="flex flex-col gap-1 font-mono text-xs tracking-wider uppercase">
            {STEPS.map((label, i) => (
              <li key={label} className="flex items-center gap-2">
                <span className="flex size-5 items-center justify-center border-2 border-inverted text-[10px]">
                  {i + 1}
                </span>
                {label}
              </li>
            ))}
          </ol>
        </div>
      </aside>
      <section className="flex flex-1 items-center justify-center p-6">
        <div className="flex w-full max-w-md flex-col gap-4">
          <div className="flex flex-col gap-1 lg:hidden">
            <Link href="/" className="font-display text-2xl uppercase">
              {siteConfig.name}
            </Link>
          </div>
          <h1 className="font-display text-3xl uppercase">One last thing</h1>
          <RestaurantOnboardingForm needsName={!user.isOnboarded} />
        </div>
      </section>
    </main>
  )
}
