import { z } from "zod"

const MAX_EMAIL = 254
const MAX_NAME = 100

export const SIGNUP_ROLES = ["user", "restaurant"] as const
export type SignupRole = (typeof SIGNUP_ROLES)[number]

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(MAX_EMAIL)
  .pipe(z.email())

export const signupRoleSchema = z.enum(SIGNUP_ROLES)

export const nameSchema = z.string().trim().min(1).max(MAX_NAME)

export const onboardFormSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
})

export const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  role: z.enum(["admin", "restaurant", "user"]),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  isOnboarded: z.boolean(),
  avatarUrl: z.string().nullable(),
  createdAt: z.string(),
})
export type User = z.infer<typeof userSchema>

export const tokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
})
export type Tokens = z.infer<typeof tokensSchema>

const roleMismatchSchema = z.object({
  status: z.literal("role_mismatch"),
  role: z.string(),
})

export const magicLinkResultSchema = z.discriminatedUnion("status", [
  z.object({ status: z.literal("sent") }),
  roleMismatchSchema,
])
export type MagicLinkResult = z.infer<typeof magicLinkResultSchema>

export const authResultSchema = z.discriminatedUnion("status", [
  z
    .object({ status: z.literal("authenticated"), user: userSchema })
    .extend(tokensSchema.shape),
  roleMismatchSchema,
])
export type AuthResult = z.infer<typeof authResultSchema>

export const guestResultSchema = z.object({
  accessToken: z.string(),
  expiresIn: z.number(),
})
export type GuestResult = z.infer<typeof guestResultSchema>
