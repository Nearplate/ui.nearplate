import { describe, expect, it } from "vitest"

import {
  authResultSchema,
  emailSchema,
  magicLinkResultSchema,
  signupRoleSchema,
} from "./schemas"

const USER = {
  id: "u1",
  email: "a@b.co",
  role: "user",
  firstName: null,
  lastName: null,
  isOnboarded: false,
  avatarUrl: null,
  phoneNumber: null,
  dateOfBirth: null,
  anniversaryDate: null,
  gender: null,
  createdAt: "2026-01-01T00:00:00.000Z",
}

describe("emailSchema", () => {
  it("trims and lowercases", () => {
    expect(emailSchema.parse("  Asha@Example.COM ")).toBe("asha@example.com")
  })

  it("rejects malformed addresses", () => {
    expect(emailSchema.safeParse("not-an-email").success).toBe(false)
  })
})

describe("signupRoleSchema", () => {
  it("accepts user and restaurant only", () => {
    expect(signupRoleSchema.safeParse("user").success).toBe(true)
    expect(signupRoleSchema.safeParse("restaurant").success).toBe(true)
    expect(signupRoleSchema.safeParse("admin").success).toBe(false)
  })
})

describe("magicLinkResultSchema", () => {
  it("parses sent and role_mismatch", () => {
    expect(magicLinkResultSchema.parse({ status: "sent" })).toEqual({
      status: "sent",
    })
    expect(
      magicLinkResultSchema.parse({ status: "role_mismatch", role: "user" })
    ).toEqual({ status: "role_mismatch", role: "user" })
  })
})

describe("authResultSchema", () => {
  it("parses an authenticated result with tokens", () => {
    const parsed = authResultSchema.parse({
      status: "authenticated",
      user: USER,
      accessToken: "at",
      refreshToken: "rt",
      expiresIn: 900,
    })

    expect(parsed.status).toBe("authenticated")
  })

  it("rejects an authenticated result missing tokens", () => {
    expect(
      authResultSchema.safeParse({ status: "authenticated", user: USER })
        .success
    ).toBe(false)
  })
})
