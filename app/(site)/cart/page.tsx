import type { Metadata } from "next"

import { CartsView } from "@/features/cart/components/carts-view"

export const metadata: Metadata = { title: "Your cart" }

export default function CartPage() {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-3 p-4 md:p-6">
      <h1 className="font-display text-4xl uppercase">Your cart</h1>
      <CartsView />
    </section>
  )
}
