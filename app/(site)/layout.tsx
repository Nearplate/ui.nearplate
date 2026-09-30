import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { getAccessToken, getSession } from "@/features/auth/session"
import { listCarts } from "@/features/cart/api/cart-api"
import { CartProvider, type CartMode } from "@/features/cart/cart-context"
import type { Cart } from "@/features/cart/schemas"
import { ApiError } from "@/lib/api/client"

/** The signed-in customer's carts. An API outage leaves the site up with an empty cart. */
async function loadServerCarts(): Promise<Cart[]> {
  const accessToken = await getAccessToken()
  if (!accessToken) return []

  try {
    return await listCarts(accessToken)
  } catch (error) {
    if (error instanceof ApiError) return []
    throw error
  }
}

export default async function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getSession()
  // Visitors keep a cart on this device; customers keep it on their account;
  // restaurant and admin accounts cannot order at all.
  const mode: CartMode = !user
    ? "guest"
    : user.role === "user"
      ? "server"
      : "disabled"
  const initialCarts = mode === "server" ? await loadServerCarts() : []

  return (
    <CartProvider key={mode} mode={mode} initialCarts={initialCarts}>
      <div className="flex min-h-svh flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>
    </CartProvider>
  )
}
