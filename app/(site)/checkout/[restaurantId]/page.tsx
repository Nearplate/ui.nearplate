import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { listAddresses } from "@/features/account/api/address-api"
import { getAccessToken, getSession } from "@/features/auth/session"
import { getCart } from "@/features/cart/api/cart-api"
import { CheckoutForm } from "@/features/cart/components/checkout-form"
import type { Cart } from "@/features/cart/schemas"
import { ApiError } from "@/lib/api/client"

export const metadata: Metadata = { title: "Checkout" }

const HTTP_NOT_FOUND = 404

interface CheckoutPageProps {
  params: Promise<{ restaurantId: string }>
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { restaurantId } = await params

  const user = await getSession()
  if (!user) redirect("/auth")
  if (user.role === "restaurant") redirect("/restaurant")
  if (!user.isOnboarded) redirect("/onboarding")

  const accessToken = await getAccessToken()
  if (!accessToken) redirect("/auth")

  let cart: Cart
  try {
    cart = await getCart(accessToken, restaurantId)
  } catch (error) {
    // No such cart (already ordered, cleared, or a stale link): back to the cart list.
    if (error instanceof ApiError && error.status === HTTP_NOT_FOUND) {
      redirect("/cart")
    }
    throw error
  }
  const addresses = await listAddresses(accessToken)

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-3 p-4 md:p-6">
      <h1 className="font-display text-4xl uppercase">Checkout</h1>
      <CheckoutForm cart={cart} addresses={addresses} />
    </section>
  )
}
