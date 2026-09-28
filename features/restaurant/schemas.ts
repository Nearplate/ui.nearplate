import { z } from "zod"

const MAX_NAME = 120
const MAX_CUISINE = 40
const MAX_CUISINES = 10
const MAX_LINE = 200
const MAX_SHORT = 40
const MAX_CATEGORY = 60
const MAX_DESCRIPTION = 500
const MAX_URL = 2048

export const RESTAURANT_STATUSES = ["online", "offline"] as const
export type RestaurantStatus = (typeof RESTAURANT_STATUSES)[number]

export const FOOD_TYPES = ["veg", "egg", "non-veg"] as const
export type FoodType = (typeof FOOD_TYPES)[number]

export const FOOD_TYPE_LABELS: Record<FoodType, string> = {
  veg: "Veg",
  egg: "Egg",
  "non-veg": "Non Veg",
}

export const DEFAULT_CATEGORIES = [
  "Starters",
  "Mains",
  "Breads",
  "Rice & Biryani",
  "Desserts",
  "Beverages",
] as const

export const addressSchema = z.object({
  id: z.string(),
  line1: z.string(),
  line2: z.string().nullable(),
  city: z.string(),
  state: z.string(),
  zipcode: z.string(),
  phoneNumber: z.string().nullable(),
})
export type Address = z.infer<typeof addressSchema>

export const restaurantSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  status: z.enum(RESTAURANT_STATUSES),
  cuisines: z.array(z.string()),
  isPureVeg: z.boolean(),
  description: z.string().nullable(),
  logoUrl: z.string().nullable(),
  bannerUrl: z.string().nullable(),
  coordinates: z.tuple([z.number(), z.number()]),
  address: addressSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type Restaurant = z.infer<typeof restaurantSchema>

export const menuItemSchema = z.object({
  id: z.string(),
  restaurantId: z.string(),
  name: z.string(),
  category: z.string(),
  description: z.string().nullable(),
  imageUrl: z.string().nullable(),
  priceInPaise: z.number().int(),
  foodType: z.enum(FOOD_TYPES),
  isAvailable: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type MenuItem = z.infer<typeof menuItemSchema>

export const qrCodeSchema = z.object({
  url: z.string(),
  pngDataUrl: z.string(),
  svgDataUrl: z.string(),
})
export type QrCode = z.infer<typeof qrCodeSchema>

/** Shared limits, mirroring the API transformer's `_line`/`_short`/etc. */
const line = z.string().trim().min(1).max(MAX_LINE)
const short = z.string().trim().min(1).max(MAX_SHORT)

export const addressFormSchema = z.object({
  line1: line,
  line2: line.nullable().optional(),
  city: short,
  state: short,
  zipcode: short,
  phoneNumber: short,
})

const coordinatesFormSchema = z.tuple([
  z.number().min(-180).max(180),
  z.number().min(-90).max(90),
])

const cuisinesFormSchema = z
  .array(z.string().trim().toLowerCase().min(1).max(MAX_CUISINE))
  .min(1)
  .max(MAX_CUISINES)

const descriptionFormSchema = z
  .string()
  .trim()
  .max(MAX_DESCRIPTION)
  .nullable()
  .optional()

const imageUrlFormSchema = z.union([
  z.url().max(MAX_URL),
  z.literal(""),
  z.null(),
])

export const nameFormSchema = z.string().trim().min(1).max(MAX_NAME)

export const createRestaurantFormSchema = z.object({
  name: nameFormSchema,
  cuisines: cuisinesFormSchema,
  isPureVeg: z.boolean(),
  description: descriptionFormSchema,
  logoUrl: imageUrlFormSchema.optional(),
  bannerUrl: imageUrlFormSchema.optional(),
  coordinates: coordinatesFormSchema,
  address: addressFormSchema,
})
export type CreateRestaurantForm = z.infer<typeof createRestaurantFormSchema>

export const updateRestaurantFormSchema = z.object({
  name: nameFormSchema.optional(),
  cuisines: cuisinesFormSchema.optional(),
  isPureVeg: z.boolean().optional(),
  description: descriptionFormSchema,
  logoUrl: imageUrlFormSchema.optional(),
  bannerUrl: imageUrlFormSchema.optional(),
  coordinates: coordinatesFormSchema.optional(),
  address: addressFormSchema.partial().optional(),
})
export type UpdateRestaurantForm = z.infer<typeof updateRestaurantFormSchema>

export const categoryFormSchema = z.string().trim().min(1).max(MAX_CATEGORY)

export const menuItemFormSchema = z.object({
  name: nameFormSchema,
  category: categoryFormSchema,
  description: descriptionFormSchema,
  imageUrl: imageUrlFormSchema.optional(),
  priceInPaise: z.number().int().min(0),
  foodType: z.enum(FOOD_TYPES),
  isAvailable: z.boolean(),
})
export type MenuItemForm = z.infer<typeof menuItemFormSchema>
