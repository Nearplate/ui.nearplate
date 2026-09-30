import { beforeEach, describe, expect, it, vi } from "vitest"

import { GUEST_CART_STORAGE_KEY } from "./constants"
import {
  getGuestCartsServerSnapshot,
  getGuestCartsSnapshot,
  subscribeGuestCarts,
  writeGuestCarts,
} from "./guest-cart-store"
import { addItem } from "./cart-state"

const NOW = new Date("2026-09-30T10:00:00.000Z")

function sampleCarts() {
  return addItem(
    [],
    { id: "r1", slug: "eat-n-crave", name: "Eat N Crave", status: "online" },
    {
      id: "d1",
      name: "Paneer Tikka",
      imageUrl: null,
      priceInPaise: 24900,
      isAvailable: true,
    },
    NOW
  )
}

beforeEach(() => {
  window.localStorage.clear()
  writeGuestCarts([])
})

describe("guest cart store", () => {
  it("round-trips carts through localStorage", () => {
    const carts = sampleCarts()

    writeGuestCarts(carts)

    expect(getGuestCartsSnapshot()).toEqual(carts)
    expect(
      JSON.parse(window.localStorage.getItem(GUEST_CART_STORAGE_KEY) ?? "null")
    ).toEqual(carts)
  })

  it("returns a referentially stable snapshot until storage changes", () => {
    writeGuestCarts(sampleCarts())

    expect(getGuestCartsSnapshot()).toBe(getGuestCartsSnapshot())
  })

  it("removes the key when the carts are emptied", () => {
    writeGuestCarts(sampleCarts())

    writeGuestCarts([])

    expect(window.localStorage.getItem(GUEST_CART_STORAGE_KEY)).toBeNull()
    expect(getGuestCartsSnapshot()).toEqual([])
  })

  it("discards corrupt or malformed stored data", () => {
    window.localStorage.setItem(GUEST_CART_STORAGE_KEY, "{not json")
    expect(getGuestCartsSnapshot()).toEqual([])

    window.localStorage.setItem(
      GUEST_CART_STORAGE_KEY,
      JSON.stringify([{ restaurantId: 1 }])
    )
    expect(getGuestCartsSnapshot()).toEqual([])
  })

  it("notifies subscribers on write and stops after unsubscribe", () => {
    const listener = vi.fn()
    const unsubscribe = subscribeGuestCarts(listener)

    writeGuestCarts(sampleCarts())
    expect(listener).toHaveBeenCalledTimes(1)

    unsubscribe()
    writeGuestCarts([])
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it("notifies subscribers when another tab changes storage", () => {
    const listener = vi.fn()
    const unsubscribe = subscribeGuestCarts(listener)

    window.dispatchEvent(
      new StorageEvent("storage", { key: GUEST_CART_STORAGE_KEY })
    )

    expect(listener).toHaveBeenCalledTimes(1)
    unsubscribe()
  })

  it("serves an empty list on the server", () => {
    expect(getGuestCartsServerSnapshot()).toEqual([])
  })
})
