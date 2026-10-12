import type { Metadata } from "next"

import { BackLink } from "@/components/layout/back-link"
import { CartsView } from "@/features/cart/components/carts-view"

export const metadata: Metadata = { title: "Your cart" }

export default function CartPage() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4 md:p-6">
      <BackLink href="/#restaurants">Keep browsing</BackLink>
      <h1 className="font-display text-5xl leading-none font-light tracking-tight md:text-6xl">
        Your cart
      </h1>
      <CartsView />
    </section>
  )
}
