import "server-only"

import { z } from "zod"

const serverEnvSchema = z.object({
  API_BASE_URL: z.url().default("http://localhost:3000/v1"),
})

/** Validated server-side environment. Fails fast on a malformed value. */
export const env = serverEnvSchema.parse({
  API_BASE_URL: process.env.API_BASE_URL || undefined,
})
