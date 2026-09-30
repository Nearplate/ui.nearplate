"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

import { LOCATION_COOKIE, LOCATION_MAX_AGE_SECONDS } from "./location"
import { feedLocationSchema } from "./schemas"

export interface SetLocationResult {
  ok: boolean
}

/** Remembers where the visitor wants the feed centred (validated, httpOnly). */
export async function setFeedLocationAction(
  input: unknown
): Promise<SetLocationResult> {
  const parsed = feedLocationSchema.safeParse(input)
  if (!parsed.success) return { ok: false }

  const { lng, lat, label } = parsed.data
  ;(await cookies()).set(LOCATION_COOKIE, JSON.stringify({ lng, lat, label }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: LOCATION_MAX_AGE_SECONDS,
  })
  revalidatePath("/")
  return { ok: true }
}
