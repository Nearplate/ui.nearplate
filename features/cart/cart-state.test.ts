import { describe, expect, it } from "vitest"

import { MAX_CARTS, MAX_ITEM_QUANTITY } from "./constants"
import {
  addItem,
  clearCart,
  refreshCart,
  removeItem,
  replaceCart,
  setQuantity,
  toMergePayload,
} from "./cart-state"
import type { Cart, MenuItemRef, RestaurantRef } from "./schemas"

const NOW = new Date("2026-09-30T10:00:00.000Z")
const LATER = new Date("2026-09-30T11:00:00.000Z")

function restaurant(id: string, overrides: Partial<RestaurantRef> = {}) {
  return {
    id,
    slug: `slug-${id}`,
    name: `Restaurant ${id}`,
    status: "online",
    ...overrides,
  } satisfies RestaurantRef
}

function dish(id: string, overrides: Partial<MenuItemRef> = {}) {
  return {
    id,
    name: `Dish ${id}`,
    imageUrl: null,
    priceInPaise: 10000,
    isAvailable: true,
    ...overrides,
  } satisfies MenuItemRef
}

/** Deep-freezes so any in-place mutation in the code under test throws. */
function frozen<T>(value: T): T {
  if (value && typeof value === "object") {
    Object.values(value).forEach(frozen)
    Object.freeze(value)
  }
  return value
}

describe("addItem", () => {
  it("creates a priced cart for the first line", () => {
    const carts = addItem([], restaurant("r1"), dish("d1"), NOW)

    expect(carts).toHaveLength(1)
    expect(carts[0]).toMatchObject({
      restaurantId: "r1",
      restaurant: { name: "Restaurant r1", slug: "slug-r1", status: "online" },
      itemCount: 1,
      subtotalInPaise: 10000,
      totalInPaise: 10000,
      canCheckout: true,
      updatedAt: NOW.toISOString(),
    })
    expect(carts[0].items[0]).toMatchObject({
      menuItemId: "d1",
      quantity: 1,
      lineTotalInPaise: 10000,
    })
  })

  it("increments an existing line and recomputes totals", () => {
    const once = addItem([], restaurant("r1"), dish("d1"), NOW)
    const twice = addItem(frozen(once), restaurant("r1"), dish("d1"), LATER)

    expect(twice[0].items[0].quantity).toBe(2)
    expect(twice[0].itemCount).toBe(2)
    expect(twice[0].subtotalInPaise).toBe(20000)
    expect(twice[0].updatedAt).toBe(LATER.toISOString())
  })

  it("caps a line at the maximum quantity", () => {
    let carts: Cart[] = []
    for (let i = 0; i < MAX_ITEM_QUANTITY + 3; i += 1) {
      carts = addItem(carts, restaurant("r1"), dish("d1"), NOW)
    }

    expect(carts[0].items[0].quantity).toBe(MAX_ITEM_QUANTITY)
  })

  it("ignores an unavailable item", () => {
    const carts = frozen(addItem([], restaurant("r1"), dish("d1"), NOW))

    const next = addItem(
      carts,
      restaurant("r1"),
      dish("d2", { isAvailable: false }),
      NOW
    )

    expect(next).toBe(carts)
  })

  it("ignores items from an offline restaurant", () => {
    const next = addItem(
      [],
      restaurant("r1", { status: "offline" }),
      dish("d1"),
      NOW
    )

    expect(next).toEqual([])
  })

  it("keeps carts most recently touched first and evicts the oldest past the limit", () => {
    let carts: Cart[] = []
    for (let i = 1; i <= MAX_CARTS + 1; i += 1) {
      carts = addItem(
        carts,
        restaurant(`r${i}`),
        dish(`d${i}`),
        new Date(NOW.getTime() + i * 1000)
      )
    }

    expect(carts).toHaveLength(MAX_CARTS)
    expect(carts[0].restaurantId).toBe(`r${MAX_CARTS + 1}`)
    expect(carts.some((cart) => cart.restaurantId === "r1")).toBe(false)
  })
})

describe("setQuantity", () => {
  const base = frozen(addItem([], restaurant("r1"), dish("d1"), NOW))

  it("sets the quantity outright", () => {
    const next = setQuantity(base, "r1", "d1", 5, LATER)

    expect(next[0].items[0].quantity).toBe(5)
    expect(next[0].subtotalInPaise).toBe(50000)
  })

  it("clamps to the maximum quantity", () => {
    const next = setQuantity(base, "r1", "d1", 999, LATER)

    expect(next[0].items[0].quantity).toBe(MAX_ITEM_QUANTITY)
  })

  it("removes the line, and the emptied cart, at zero", () => {
    expect(setQuantity(base, "r1", "d1", 0, LATER)).toEqual([])
  })

  it("leaves carts unchanged for an unknown line", () => {
    expect(setQuantity(base, "r1", "nope", 3, LATER)).toBe(base)
    expect(setQuantity(base, "nope", "d1", 3, LATER)).toBe(base)
  })
})

describe("removeItem / clearCart / replaceCart", () => {
  const two = frozen(
    addItem(
      addItem([], restaurant("r1"), dish("d1"), NOW),
      restaurant("r1"),
      dish("d2"),
      NOW
    )
  )

  it("removes one line and keeps the cart while lines remain", () => {
    const next = removeItem(two, "r1", "d1", LATER)

    expect(next[0].items.map((line) => line.menuItemId)).toEqual(["d2"])
  })

  it("drops the cart when its last line goes", () => {
    const next = removeItem(
      removeItem(two, "r1", "d1", LATER),
      "r1",
      "d2",
      LATER
    )

    expect(next).toEqual([])
  })

  it("clears one restaurant's cart only", () => {
    const both = addItem(two, restaurant("r2"), dish("d9"), LATER)

    expect(clearCart(both, "r1").map((cart) => cart.restaurantId)).toEqual([
      "r2",
    ])
  })

  it("replaces a cart with the server's version, or removes it when null", () => {
    const [server] = addItem([], restaurant("r1"), dish("d7"), LATER)

    expect(replaceCart(two, "r1", server)[0].items[0].menuItemId).toBe("d7")
    expect(replaceCart(two, "r1", null)).toEqual([])
    expect(replaceCart(two, "r1", { ...server, items: [] })).toEqual([])
  })
})

describe("refreshCart", () => {
  const base = frozen(
    addItem(
      addItem([], restaurant("r1"), dish("d1"), NOW),
      restaurant("r1"),
      dish("d2"),
      NOW
    )
  )

  it("updates price, name and availability from the live menu", () => {
    const next = refreshCart(base, restaurant("r1"), [
      dish("d1", { priceInPaise: 15000, name: "Renamed" }),
      dish("d2", { isAvailable: false }),
    ])

    expect(next[0].items[0]).toMatchObject({
      name: "Renamed",
      priceInPaise: 15000,
      lineTotalInPaise: 15000,
    })
    expect(next[0].items[1].isAvailable).toBe(false)
    expect(next[0].canCheckout).toBe(false)
    expect(next[0].subtotalInPaise).toBe(25000)
  })

  it("drops lines no longer on the menu, and the cart when none remain", () => {
    const partial = refreshCart(base, restaurant("r1"), [dish("d2")])
    expect(partial[0].items.map((line) => line.menuItemId)).toEqual(["d2"])

    expect(refreshCart(base, restaurant("r1"), [])).toEqual([])
  })

  it("returns the same array when nothing changed", () => {
    expect(refreshCart(base, restaurant("r1"), [dish("d1"), dish("d2")])).toBe(
      base
    )
  })

  it("marks the cart not checkout-ready when the restaurant is offline", () => {
    const next = refreshCart(base, restaurant("r1", { status: "offline" }), [
      dish("d1"),
      dish("d2"),
    ])

    expect(next[0].restaurant.status).toBe("offline")
    expect(next[0].canCheckout).toBe(false)
  })
})

describe("toMergePayload", () => {
  it("keeps only ids and quantities", () => {
    const carts = addItem([], restaurant("r1"), dish("d1"), NOW)

    expect(toMergePayload(carts)).toEqual({
      carts: [
        { restaurantId: "r1", items: [{ menuItemId: "d1", quantity: 1 }] },
      ],
    })
  })
})
