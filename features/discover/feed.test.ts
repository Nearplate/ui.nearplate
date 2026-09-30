import { describe, expect, it } from "vitest"

import type { MenuItem } from "@/features/restaurant/schemas"

import {
  buildFeed,
  formatDistance,
  groupMenuByCategory,
  rankCuisines,
} from "./feed"
import type { NearbyRestaurant } from "./schemas"

const NOW = new Date("2026-09-30T12:00:00.000Z")
const DAY_MS = 24 * 60 * 60 * 1000

function restaurant(
  id: string,
  overrides: Partial<NearbyRestaurant> = {}
): NearbyRestaurant {
  return {
    id,
    slug: id,
    name: id,
    status: "online",
    cuisines: [],
    isPureVeg: false,
    description: null,
    logoUrl: null,
    bannerUrl: null,
    coordinates: [77.2, 28.6],
    address: {
      id: `a-${id}`,
      line1: "1 Main St",
      line2: null,
      city: "Delhi",
      state: "DL",
      zipcode: "110001",
      phoneNumber: null,
    },
    createdAt: new Date(NOW.getTime() - 100 * DAY_MS).toISOString(),
    updatedAt: NOW.toISOString(),
    distanceMeters: 500,
    ...overrides,
  }
}

describe("formatDistance", () => {
  it("shows whole metres under a kilometre", () => {
    expect(formatDistance(850)).toBe("850 m")
  })

  it("shows one decimal of kilometres from 1000 m", () => {
    expect(formatDistance(2432)).toBe("2.4 km")
  })

  it("rounds sub-10 m distances up to a floor of 10 m", () => {
    expect(formatDistance(3)).toBe("10 m")
  })
})

describe("rankCuisines", () => {
  it("orders cuisines by how many restaurants serve them", () => {
    const list = [
      restaurant("a", { cuisines: ["biryani", "mughlai"] }),
      restaurant("b", { cuisines: ["biryani"] }),
      restaurant("c", { cuisines: ["pizza"] }),
    ]
    expect(rankCuisines(list, 10)).toEqual(["biryani", "mughlai", "pizza"])
  })

  it("caps the list at the limit", () => {
    const list = [restaurant("a", { cuisines: ["x", "y", "z"] })]
    expect(rankCuisines(list, 2)).toHaveLength(2)
  })
})

describe("buildFeed", () => {
  it("keeps nearest-first order for the closest rail, capped at 8", () => {
    const list = Array.from({ length: 10 }, (_, i) =>
      restaurant(`r${i}`, { distanceMeters: i * 100 })
    )
    const feed = buildFeed(list, NOW)
    expect(feed.closest.map((r) => r.id)).toEqual(
      list.slice(0, 8).map((r) => r.id)
    )
  })

  it("puts only restaurants created within 30 days in the new rail", () => {
    const fresh = restaurant("fresh", {
      createdAt: new Date(NOW.getTime() - 5 * DAY_MS).toISOString(),
    })
    const old = restaurant("old")
    expect(buildFeed([fresh, old], NOW).fresh.map((r) => r.id)).toEqual([
      "fresh",
    ])
  })

  it("puts only pure veg restaurants in the veg rail", () => {
    const veg = restaurant("veg", { isPureVeg: true })
    const other = restaurant("other")
    expect(buildFeed([veg, other], NOW).pureVeg.map((r) => r.id)).toEqual([
      "veg",
    ])
  })

  it("builds a rail for each of the top two cuisines", () => {
    const list = [
      restaurant("a", { cuisines: ["biryani"] }),
      restaurant("b", { cuisines: ["biryani"] }),
      restaurant("c", { cuisines: ["pizza"] }),
      restaurant("d", { cuisines: ["thai"] }),
    ]
    const feed = buildFeed(list, NOW)
    expect(feed.cuisineRails.map((r) => r.cuisine)).toEqual([
      "biryani",
      "pizza",
    ])
    expect(feed.cuisineRails[0].restaurants.map((r) => r.id)).toEqual([
      "a",
      "b",
    ])
  })

  it("returns empty rails for an empty list", () => {
    const feed = buildFeed([], NOW)
    expect(feed.closest).toEqual([])
    expect(feed.fresh).toEqual([])
    expect(feed.pureVeg).toEqual([])
    expect(feed.cuisineRails).toEqual([])
    expect(feed.cuisines).toEqual([])
  })

  it("does not mutate the input list", () => {
    const list = [restaurant("a"), restaurant("b")]
    const copy = [...list]
    buildFeed(list, NOW)
    expect(list).toEqual(copy)
  })
})

describe("groupMenuByCategory", () => {
  function item(id: string, category: string): MenuItem {
    return {
      id,
      restaurantId: "r",
      name: id,
      category,
      description: null,
      imageUrl: null,
      priceInPaise: 1000,
      foodType: "veg",
      isAvailable: true,
      createdAt: NOW.toISOString(),
      updatedAt: NOW.toISOString(),
    }
  }

  it("groups items by category preserving first-seen category order", () => {
    const groups = groupMenuByCategory([
      item("a", "Mains"),
      item("b", "Starters"),
      item("c", "Mains"),
    ])
    expect(groups.map((g) => g.category)).toEqual(["Mains", "Starters"])
    expect(groups[0].items.map((i) => i.id)).toEqual(["a", "c"])
  })

  it("returns no groups for an empty menu", () => {
    expect(groupMenuByCategory([])).toEqual([])
  })
})
