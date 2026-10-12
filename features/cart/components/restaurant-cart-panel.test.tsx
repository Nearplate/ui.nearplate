import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { addItem } from "../cart-state"
import { CartProvider, type CartMode } from "../cart-context"
import { GUEST_CART_STORAGE_KEY } from "../constants"
import type { Cart, MenuItemRef, RestaurantRef } from "../schemas"
import { RestaurantCartPanel } from "./restaurant-cart-panel"

vi.mock("../actions")

const NOW = new Date("2026-09-30T10:00:00.000Z")
const KITCHEN: RestaurantRef = {
  id: "r1",
  slug: "eat-n-crave",
  name: "Eat N Crave",
  status: "online",
}
const PANEER: MenuItemRef = {
  id: "d1",
  name: "Paneer Tikka",
  imageUrl: null,
  priceInPaise: 24900,
  isAvailable: true,
}

beforeEach(() => {
  window.localStorage.clear()
})

/** Guests keep carts on the device; customers get them from the server. */
function renderPanel(mode: CartMode, carts: Cart[]) {
  if (mode === "guest") {
    window.localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(carts))
  }
  return render(
    <CartProvider mode={mode} initialCarts={carts}>
      <RestaurantCartPanel restaurantId="r1" restaurantName="Eat N Crave" />
    </CartProvider>
  )
}

describe("RestaurantCartPanel", () => {
  it("shows an empty plate before anything is added", () => {
    renderPanel("guest", [])
    expect(screen.getByText("Your plate is empty")).toBeInTheDocument()
  })

  it("lists this restaurant's lines with the subtotal", () => {
    const carts = addItem(
      addItem([], KITCHEN, PANEER, NOW),
      KITCHEN,
      PANEER,
      NOW
    )
    renderPanel("server", carts)
    expect(screen.getByText("Paneer Tikka")).toBeInTheDocument()
    expect(screen.getByText("₹498.00", { selector: "dd" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Checkout" })).toHaveAttribute(
      "href",
      "/checkout/r1"
    )
  })

  it("asks a guest to log in to check out", () => {
    renderPanel("guest", addItem([], KITCHEN, PANEER, NOW))
    expect(
      screen.getByRole("button", { name: "Log in to checkout" })
    ).toBeInTheDocument()
  })

  it("clears the cart", async () => {
    renderPanel("guest", addItem([], KITCHEN, PANEER, NOW))
    await userEvent.click(screen.getByRole("button", { name: "Clear" }))
    expect(screen.getByText("Your plate is empty")).toBeInTheDocument()
  })

  it("renders nothing for accounts that cannot order", () => {
    const { container } = renderPanel("disabled", [])
    expect(container).toBeEmptyDOMElement()
  })
})
