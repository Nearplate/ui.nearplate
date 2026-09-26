import { describe, expect, it, vi } from "vitest"

import {
  ACCESS_COOKIE,
  clearSessionCookies,
  REFRESH_COOKIE,
  writeSessionCookies,
} from "./session-cookies"

function fakeJar() {
  return { set: vi.fn(), delete: vi.fn() }
}

describe("writeSessionCookies", () => {
  it("stores httpOnly lax cookies with the access token TTL", () => {
    const jar = fakeJar()

    writeSessionCookies(jar, {
      accessToken: "at",
      refreshToken: "rt",
      expiresIn: 900,
    })

    expect(jar.set).toHaveBeenCalledWith(
      ACCESS_COOKIE,
      "at",
      expect.objectContaining({
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 900,
      })
    )
    expect(jar.set).toHaveBeenCalledWith(
      REFRESH_COOKIE,
      "rt",
      expect.objectContaining({ httpOnly: true, maxAge: 60 * 60 * 24 * 30 })
    )
  })
})

describe("clearSessionCookies", () => {
  it("removes access, refresh and guest cookies", () => {
    const jar = fakeJar()

    clearSessionCookies(jar)

    expect(jar.delete).toHaveBeenCalledTimes(3)
  })
})
