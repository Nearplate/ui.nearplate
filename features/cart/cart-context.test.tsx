import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { notifyError } from "@/lib/toast"

import {
  addToCartAction,
  mergeGuestCartsAction,
  setCartItemQuantityAction,
} from "./actions"
import { addItem } from "./cart-state"
import { CartProvider, useCart, type CartMode } from "./cart-context"
import { GUEST_CART_STORAGE_KEY } from "./constants"
import { writeGuestCarts } from "./guest-cart-store"
import type { Cart, MenuItemRef, RestaurantRef } from "./schemas"

vi.mock("./actions")
vi.mock("@/lib/toast", () => ({ notifyError: vi.fn() }))

const RESTAURANT: RestaurantRef = {
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
const NOW = new Date("2026-09-30T10:00:00.000Z")

/** A cart holding `quantity` paneer tikka, as the server or store would hold it. */
function cartWith(quantity: number): Cart {
  let carts: Cart[] = []
  for (let i = 0; i < quantity; i += 1) {
    carts = addItem(carts, RESTAURANT, PANEER, NOW)
  }
  return carts[0]
}

function Probe() {
  const cart = useCart()
  return (
    <div>
      <span data-testid="count">{cart.itemCount}</span>
      <span data-testid="quantity">{cart.quantityOf("r1", "d1")}</span>
      <span data-testid="price">
        {cart.cartFor("r1")?.items[0]?.priceInPaise ?? "-"}
      </span>
      <button onClick={() => cart.add(RESTAURANT, PANEER)}>add</button>
      <button onClick={() => cart.setItemQuantity("r1", "d1", 0)}>zero</button>
      <button
        onClick={() =>
          cart.syncMenu(RESTAURANT, [{ ...PANEER, priceInPaise: 30000 }])
        }
      >
        sync
      </button>
    </div>
  )
}

function renderCart(mode: CartMode, initialCarts: Cart[] = []) {
  return render(
    <CartProvider mode={mode} initialCarts={initialCarts}>
      <Probe />
    </CartProvider>
  )
}

function click(name: string) {
  fireEvent.click(screen.getByRole("button", { name }))
}

beforeEach(() => {
  vi.clearAllMocks()
  window.localStorage.clear()
  writeGuestCarts([])
})

describe("guest mode", () => {
  it("keeps carts in localStorage and counts items", () => {
    renderCart("guest")

    click("add")
    click("add")

    expect(screen.getByTestId("count")).toHaveTextContent("2")
    expect(screen.getByTestId("quantity")).toHaveTextContent("2")
    expect(
      JSON.parse(window.localStorage.getItem(GUEST_CART_STORAGE_KEY) ?? "[]")
    ).toHaveLength(1)
  })

  it("removes the line, and the storage key, at quantity zero", () => {
    renderCart("guest")
    click("add")

    click("zero")

    expect(screen.getByTestId("count")).toHaveTextContent("0")
    expect(window.localStorage.getItem(GUEST_CART_STORAGE_KEY)).toBeNull()
  })

  it("refreshes stored prices from the live menu", () => {
    renderCart("guest")
    click("add")

    click("sync")

    expect(screen.getByTestId("price")).toHaveTextContent("30000")
  })

  it("restores carts stored by an earlier visit", () => {
    writeGuestCarts([cartWith(3)])

    renderCart("guest")

    expect(screen.getByTestId("quantity")).toHaveTextContent("3")
  })
})

describe("disabled mode", () => {
  it("ignores add", () => {
    renderCart("disabled")

    click("add")

    expect(screen.getByTestId("count")).toHaveTextContent("0")
    expect(addToCartAction).not.toHaveBeenCalled()
    expect(window.localStorage.getItem(GUEST_CART_STORAGE_KEY)).toBeNull()
  })
})

describe("server mode", () => {
  it("shows an add immediately, creates the line, then sets later quantities", async () => {
    vi.mocked(addToCartAction).mockResolvedValue({
      status: "ok",
      cart: cartWith(1),
    })
    vi.mocked(setCartItemQuantityAction).mockResolvedValue({
      status: "ok",
      cart: cartWith(2),
    })
    renderCart("server")

    click("add")
    expect(screen.getByTestId("quantity")).toHaveTextContent("1")
    click("add")
    expect(screen.getByTestId("quantity")).toHaveTextContent("2")

    await waitFor(() =>
      expect(setCartItemQuantityAction).toHaveBeenCalledWith("r1", "d1", 2)
    )
    expect(addToCartAction).toHaveBeenCalledWith("r1", "d1")
    await waitFor(() =>
      expect(screen.getByTestId("quantity")).toHaveTextContent("2")
    )
  })

  it("rolls back and notifies when the server refuses", async () => {
    vi.mocked(addToCartAction).mockResolvedValue({
      status: "error",
      message: "This restaurant or item isn't available right now.",
    })
    renderCart("server")

    click("add")

    await waitFor(() =>
      expect(notifyError).toHaveBeenCalledWith(
        "This restaurant or item isn't available right now."
      )
    )
    expect(screen.getByTestId("quantity")).toHaveTextContent("0")
  })

  it("rolls back and notifies when the request itself fails", async () => {
    vi.mocked(addToCartAction).mockRejectedValue(new Error("network"))
    renderCart("server")

    click("add")

    await waitFor(() => expect(notifyError).toHaveBeenCalled())
    expect(screen.getByTestId("quantity")).toHaveTextContent("0")
  })

  it("merges guest carts into the account once and clears them", async () => {
    writeGuestCarts([cartWith(1)])
    vi.mocked(mergeGuestCartsAction).mockResolvedValue({
      status: "ok",
      carts: [cartWith(2)],
    })

    renderCart("server")

    await waitFor(() =>
      expect(screen.getByTestId("count")).toHaveTextContent("2")
    )
    expect(mergeGuestCartsAction).toHaveBeenCalledTimes(1)
    expect(mergeGuestCartsAction).toHaveBeenCalledWith({
      carts: [
        { restaurantId: "r1", items: [{ menuItemId: "d1", quantity: 1 }] },
      ],
    })
    expect(window.localStorage.getItem(GUEST_CART_STORAGE_KEY)).toBeNull()
  })

  it("keeps guest carts for a retry when the merge fails", async () => {
    writeGuestCarts([cartWith(1)])
    vi.mocked(mergeGuestCartsAction).mockResolvedValue({
      status: "error",
      message: "Something went wrong. Please try again.",
    })

    renderCart("server")

    await waitFor(() => expect(notifyError).toHaveBeenCalled())
    expect(window.localStorage.getItem(GUEST_CART_STORAGE_KEY)).not.toBeNull()
  })

  it("does not merge when there is nothing stored", () => {
    renderCart("server")

    expect(mergeGuestCartsAction).not.toHaveBeenCalled()
  })
})
