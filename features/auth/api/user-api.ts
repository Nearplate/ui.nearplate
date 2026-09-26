import "server-only"

import { apiRequest } from "@/lib/api/client"

import { userSchema, type User } from "../schemas"

/** GET /users/me */
export async function getMe(accessToken: string): Promise<User> {
  return userSchema.parse(await apiRequest("/users/me", { token: accessToken }))
}

/** PATCH /users/me: at least one field is required by the API. */
export async function updateMe(
  accessToken: string,
  patch: { firstName?: string; lastName?: string }
): Promise<User> {
  return userSchema.parse(
    await apiRequest("/users/me", {
      method: "PATCH",
      body: patch,
      token: accessToken,
    })
  )
}

/** POST /users/me/onboard: sets first and last name. */
export async function onboard(
  accessToken: string,
  names: { firstName: string; lastName: string }
): Promise<User> {
  return userSchema.parse(
    await apiRequest("/users/me/onboard", {
      method: "POST",
      body: names,
      token: accessToken,
    })
  )
}
