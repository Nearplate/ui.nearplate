import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { addItem } from "../cart-state"
import { CartProvider, type CartMode } from "../cart-context"
import type { Cart, MenuItemRef, RestaurantRef } from "../schemas"
import { FloatingCart, summarizeCarts } from "./floating-cart"

const pathname = vi.hoisted(() => ({ value: "/" }))
vi.mock("next/navigation", () => ({ usePathname: () => pathname.value }))
vi.mock("../actions")

const NOW = new Date("2026-09-30T10:00:00.000Z")
const EAT_N_CRAVE: RestaurantRef = {
  id: "r1",
  slug: "eat-n-crave",
  name: "Eat N Crave",
  status: "online",
}
const TIFFIN: RestaurantRef = {
  id: "r2",
  slug: "tiffin-system",
  name: "Tiffin System",
  status: "online",
}
const PANEER: MenuItemRef = {
  id: "d1",
  name: "Paneer Tikka",
  imageUrl: null,
  priceInPaise: 24900,
  isAvailable: true,
}

function cartWith(restaurant: RestaurantRef, quantity: number): Cart {
  let carts: Cart[] = []
  for (let i = 0; i < quantity; i += 1) {
    carts = addItem(carts, restaurant, PANEER, NOW)
  }
  return carts[0]
}

function renderBar(mode: CartMode, carts: Cart[]) {
  return render(
    <CartProvider mode={mode} initialCarts={carts}>
      <FloatingCart />
    </CartProvider>
  )
}

beforeEach(() => {
  pathname.value = "/"
})

describe("summarizeCarts", () => {
  it("names the restaurant when there is one cart", () => {
    const summary = summarizeCarts([cartWith(EAT_N_CRAVE, 3)])

    expect(summary).toEqual({
      title: "Eat N Crave",
      itemCount: 3,
      subtotalInPaise: 74700,
    })
  })

  it("counts restaurants and sums totals across carts", () => {
    const summary = summarizeCarts([
      cartWith(EAT_N_CRAVE, 2),
      cartWith(TIFFIN, 1),
    ])

    expect(summary).toEqual({
      title: "2 restaurants",
      itemCount: 3,
      subtotalInPaise: 74700,
    })
  })
})

describe("FloatingCart", () => {
  it("renders nothing when the cart is empty", () => {
    renderBar("server", [])

    expect(screen.queryByRole("link")).not.toBeInTheDocument()
  })

  it("renders nothing for accounts that cannot order", () => {
    renderBar("disabled", [])

    expect(screen.queryByRole("link")).not.toBeInTheDocument()
  })

  it.each(["/cart", "/checkout/r1"])("renders nothing on %s", (path) => {
    pathname.value = path

    renderBar("server", [cartWith(EAT_N_CRAVE, 1)])

    expect(screen.queryByRole("link")).not.toBeInTheDocument()
  })

  it("links to the cart with the restaurant, count and subtotal", () => {
    renderBar("server", [cartWith(EAT_N_CRAVE, 3)])

    const link = screen.getByRole("link", { name: /view cart/i })
    expect(link).toHaveAttribute("href", "/cart")
    expect(link).toHaveTextContent("Eat N Crave")
    expect(link).toHaveTextContent("3 items")
    expect(link).toHaveTextContent("₹747")
  })

  it("summarises several carts as restaurants", () => {
    renderBar("server", [cartWith(EAT_N_CRAVE, 2), cartWith(TIFFIN, 1)])

    expect(screen.getByRole("link")).toHaveTextContent("2 restaurants")
  })
})
