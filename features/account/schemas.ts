import { z } from "zod"

import { nameSchema, USER_GENDERS } from "../auth/schemas"

export const ORDERS_PAGE_SIZE = 10

export function pageCount(total: number): number {
  return Math.max(1, Math.ceil(total / ORDERS_PAGE_SIZE))
}

export function pageOffset(page: number): number {
  return (page - 1) * ORDERS_PAGE_SIZE
}

export const ORDER_STATUSES = [
  "placed",
  "accepted",
  "preparing",
  "out_for_delivery",
  "delivered",
  "cancelled",
] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  placed: "Placed",
  accepted: "Accepted",
  preparing: "Preparing",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
}

const PHONE_REGEX = /^\+?[0-9]{10,15}$/

const dateFieldSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date")
  .refine((value) => !Number.isNaN(new Date(value).getTime()), {
    message: "Enter a valid date",
  })
  .refine((value) => new Date(value).getTime() <= Date.now(), {
    message: "Date cannot be in the future",
  })

/** Blank input clears the field on the API (`null`); still nullable when set. */
function nullableField<T extends z.ZodTypeAny>(schema: T) {
  return z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? null : value,
    schema.nullable()
  )
}

/** Blank input means "leave unchanged", so the field is dropped from the patch. */
function optionalName() {
  return z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    nameSchema.optional()
  )
}

export const profileFormSchema = z.object({
  firstName: optionalName(),
  lastName: optionalName(),
  phoneNumber: nullableField(
    z.string().regex(PHONE_REGEX, "Enter a valid phone number")
  ),
  dateOfBirth: nullableField(dateFieldSchema),
  anniversaryDate: nullableField(dateFieldSchema),
  gender: nullableField(z.enum(USER_GENDERS)),
})
export type ProfileFormInput = z.infer<typeof profileFormSchema>

export const addressFormSchema = z.object({
  label: z.string().trim().min(1).max(30),
  line1: z.string().trim().min(1),
  line2: nullableField(z.string().trim().min(1)),
  city: z.string().trim().min(1),
  state: z.string().trim().min(1),
  zipcode: z.string().trim().min(1),
  phoneNumber: nullableField(z.string().trim().min(1)),
  isDefault: z.boolean(),
})
export type AddressFormInput = z.infer<typeof addressFormSchema>

export const addressSchema = z.object({
  id: z.string(),
  label: z.string().nullable(),
  isDefault: z.boolean(),
  line1: z.string(),
  line2: z.string().nullable(),
  city: z.string(),
  state: z.string(),
  zipcode: z.string(),
  phoneNumber: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type AccountAddress = z.infer<typeof addressSchema>

const orderAddressSchema = z.object({
  line1: z.string(),
  line2: z.string().nullable(),
  city: z.string(),
  state: z.string(),
  zipcode: z.string(),
  phoneNumber: z.string().nullable(),
})

export const orderSummarySchema = z.object({
  id: z.string(),
  restaurantId: z.string(),
  restaurantName: z.string(),
  status: z.enum(ORDER_STATUSES),
  totalInPaise: z.number(),
  deliveryAddress: orderAddressSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type OrderSummary = z.infer<typeof orderSummarySchema>

export const orderPageSchema = z.object({
  items: z.array(orderSummarySchema),
  total: z.number(),
})
export type OrderPage = z.infer<typeof orderPageSchema>
