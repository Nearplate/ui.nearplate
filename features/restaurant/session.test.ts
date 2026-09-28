import { beforeEach, describe, expect, it, vi } from "vitest"

import { getSession } from "@/features/auth/session"

import { requireRestaurantOwner } from "./session"

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`)
  }),
}))
vi.mock("@/features/auth/session", () => ({
  getSession: vi.fn(),
  getAccessToken: vi.fn(),
}))
vi.mock("./api/restaurant-api", () => ({ listMine: vi.fn() }))

const RESTAURANT_USER = {
  id: "u1",
  email: "a@b.co",
  role: "restaurant" as const,
  firstName: null,
  lastName: null,
  isOnboarded: true,
  avatarUrl: null,
  phoneNumber: null,
  dateOfBirth: null,
  anniversaryDate: null,
  gender: null,
  createdAt: "2026-01-01T00:00:00.000Z",
}

describe("requireRestaurantOwner", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("redirects to /auth when there is no session", async () => {
    vi.mocked(getSession).mockResolvedValue(null)
    await expect(requireRestaurantOwner()).rejects.toThrow("REDIRECT:/auth")
  })

  it("redirects to / for a signed-in user role", async () => {
    vi.mocked(getSession).mockResolvedValue({
      ...RESTAURANT_USER,
      role: "user",
    })
    await expect(requireRestaurantOwner()).rejects.toThrow("REDIRECT:/")
  })

  it("returns the user for the restaurant role", async () => {
    vi.mocked(getSession).mockResolvedValue(RESTAURANT_USER)
    await expect(requireRestaurantOwner()).resolves.toEqual(RESTAURANT_USER)
  })
})
