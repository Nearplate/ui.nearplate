import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import type { NearbyRestaurant } from "../schemas"
import { RestaurantCard } from "./restaurant-card"

const BASE: NearbyRestaurant = {
  id: "1",
  slug: "spice-house",
  name: "Spice House",
  status: "online",
  cuisines: ["biryani", "mughlai"],
  isPureVeg: false,
  description: null,
  logoUrl: null,
  bannerUrl: null,
  coordinates: [77.2, 28.6],
  address: {
    id: "a",
    line1: "1 Main St",
    line2: null,
    city: "Delhi",
    state: "DL",
    zipcode: "110001",
    phoneNumber: null,
  },
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  distanceMeters: 850,
}

describe("RestaurantCard", () => {
  it("links to the public restaurant page", () => {
    render(<RestaurantCard restaurant={BASE} />)
    expect(screen.getByRole("link")).toHaveAttribute("href", "/r/spice-house")
  })

  it("shows the name, cuisines and distance", () => {
    render(<RestaurantCard restaurant={BASE} />)
    expect(screen.getByText("Spice House")).toBeInTheDocument()
    expect(screen.getByText("biryani · mughlai")).toBeInTheDocument()
    expect(screen.getByText("850 m")).toBeInTheDocument()
  })

  it("shows the pure veg badge only for pure veg restaurants", () => {
    const { rerender } = render(<RestaurantCard restaurant={BASE} />)
    expect(screen.queryByText("Pure veg")).not.toBeInTheDocument()

    rerender(<RestaurantCard restaurant={{ ...BASE, isPureVeg: true }} />)
    expect(screen.getByText("Pure veg")).toBeInTheDocument()
  })

  it("falls back to the initial when there is no banner", () => {
    render(<RestaurantCard restaurant={BASE} />)
    expect(screen.getAllByText("S").length).toBeGreaterThan(0)
  })
})
