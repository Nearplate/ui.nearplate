import { describe, expect, it } from "vitest"

import { groupOrdersByLane, nextActions, timeAgo, todayStats } from "./orders"

const order = (id: string, status: Parameters<typeof nextActions>[0]) => ({
  id,
  status,
  createdAt: "2026-10-12T07:00:00.000Z",
})

describe("nextActions", () => {
  it("offers accept and reject for a new order", () => {
    expect(nextActions("placed").map((action) => action.status)).toEqual([
      "accepted",
      "cancelled",
    ])
  })

  it("moves an out-for-delivery order only to delivered", () => {
    expect(nextActions("out_for_delivery").map((a) => a.status)).toEqual([
      "delivered",
    ])
  })

  it("offers nothing once an order is finished", () => {
    expect(nextActions("delivered")).toEqual([])
    expect(nextActions("cancelled")).toEqual([])
  })
})

describe("groupOrdersByLane", () => {
  it("puts each live order in its lane and finished ones in done", () => {
    const lanes = groupOrdersByLane([
      order("a", "placed"),
      order("b", "preparing"),
      order("c", "delivered"),
      order("d", "placed"),
      order("e", "cancelled"),
    ])
    expect(
      Object.fromEntries(
        lanes.map((lane) => [lane.id, lane.orders.map((o) => o.id)])
      )
    ).toEqual({
      new: ["a", "d"],
      accepted: [],
      kitchen: ["b"],
      delivery: [],
      done: ["c", "e"],
    })
  })
})

describe("timeAgo", () => {
  const now = new Date("2026-10-12T08:00:00.000Z")

  it("counts minutes under an hour", () => {
    expect(timeAgo("2026-10-12T07:45:00.000Z", now)).toBe("15 min ago")
  })

  it("says just now under a minute", () => {
    expect(timeAgo("2026-10-12T07:59:40.000Z", now)).toBe("Just now")
  })

  it("counts hours under a day, then days", () => {
    expect(timeAgo("2026-10-12T05:00:00.000Z", now)).toBe("3 h ago")
    expect(timeAgo("2026-10-10T08:00:00.000Z", now)).toBe("2 d ago")
  })
})

describe("todayStats", () => {
  const now = new Date("2026-10-12T10:00:00.000Z") // 15:30 in Kolkata
  const at = (
    createdAt: string,
    status: Parameters<typeof nextActions>[0],
    totalInPaise: number
  ) => ({
    createdAt,
    status,
    totalInPaise,
  })

  it("counts today's orders in Kolkata time and delivered revenue only", () => {
    const stats = todayStats(
      [
        at("2026-10-12T09:00:00.000Z", "delivered", 50000),
        at("2026-10-12T08:00:00.000Z", "preparing", 20000),
        at("2026-10-12T07:00:00.000Z", "cancelled", 99900),
        // 23:45 on the 11th in UTC is already the 12th in Kolkata.
        at("2026-10-11T19:00:00.000Z", "delivered", 10000),
        // The 11th in Kolkata: not today.
        at("2026-10-11T18:00:00.000Z", "delivered", 70000),
      ],
      now
    )
    expect(stats).toEqual({
      orders: 4,
      live: 1,
      revenueInPaise: 60000,
      averageInPaise: 30000,
    })
  })

  it("reports zero average with no delivered orders", () => {
    expect(todayStats([], now)).toEqual({
      orders: 0,
      live: 0,
      revenueInPaise: 0,
      averageInPaise: 0,
    })
  })
})
