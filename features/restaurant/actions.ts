"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import type { FormActionState } from "@/features/auth/actions"
import { getAccessToken } from "@/features/auth/session"
import { errorMessage } from "@/lib/api/error-message"

import {
  createMenuItem,
  deleteMenuItem,
  setMenuItemAvailability,
  setStatus,
  updateMenuItem,
  updateRestaurant,
} from "./api/restaurant-api"
import { parseCuisines } from "./cuisines"
import { rupeesToPaise } from "./money"
import {
  addressFormSchema,
  menuItemFormSchema,
  updateRestaurantFormSchema,
  type RestaurantStatus,
} from "./schemas"

/** `""` from an emptied optional text field means "clear it" -> `null`. */
function nullableText(value: FormDataEntryValue | null): string | null {
  const text = typeof value === "string" ? value.trim() : ""
  return text === "" ? null : text
}

function addressFromForm(formData: FormData) {
  return {
    line1: formData.get("line1"),
    line2: nullableText(formData.get("line2")),
    city: formData.get("city"),
    state: formData.get("state"),
    zipcode: formData.get("zipcode"),
    phoneNumber: formData.get("phoneNumber"),
  }
}

function coordinatesFromForm(formData: FormData): [number, number] {
  return [Number(formData.get("lng")), Number(formData.get("lat"))]
}

/** Updates the caller's restaurant profile: identity, brand and location. */
export async function updateRestaurantAction(
  _previous: FormActionState,
  formData: FormData
): Promise<FormActionState> {
  const restaurantId = formData.get("restaurantId")
  if (typeof restaurantId !== "string" || !restaurantId) {
    return { status: "error", message: "Missing restaurant." }
  }

  const parsed = updateRestaurantFormSchema.safeParse({
    name: formData.get("name"),
    cuisines: parseCuisines(String(formData.get("cuisines") ?? "")),
    isPureVeg: formData.get("isPureVeg") === "on",
    description: nullableText(formData.get("description")),
    coordinates: coordinatesFromForm(formData),
    address: addressFormSchema.partial().parse(addressFromForm(formData)),
  })
  if (!parsed.success) {
    return { status: "error", message: "Check your details and try again." }
  }

  const accessToken = await getAccessToken()
  if (!accessToken) redirect("/auth")
  try {
    await updateRestaurant(accessToken, restaurantId, {
      ...parsed.data,
    })
  } catch (error) {
    return { status: "error", message: errorMessage(error) }
  }
  revalidatePath("/restaurant", "layout")
  return { status: "success" }
}

/** Puts the restaurant online or offline; called directly from a switch. */
export async function setRestaurantStatusAction(
  restaurantId: string,
  status: RestaurantStatus
): Promise<void> {
  const accessToken = await getAccessToken()
  if (!accessToken) redirect("/auth")
  await setStatus(accessToken, restaurantId, status)
  revalidatePath("/restaurant", "layout")
}

/** Creates or updates a menu item, depending on whether `itemId` is set. */
export async function saveMenuItemAction(
  _previous: FormActionState,
  formData: FormData
): Promise<FormActionState> {
  const restaurantId = formData.get("restaurantId")
  const itemId = formData.get("itemId")
  if (typeof restaurantId !== "string" || !restaurantId) {
    return { status: "error", message: "Missing restaurant." }
  }

  let priceInPaise: number
  try {
    priceInPaise = rupeesToPaise(String(formData.get("price") ?? ""))
  } catch {
    return { status: "error", message: "Enter a valid price." }
  }

  const parsed = menuItemFormSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    description: nullableText(formData.get("description")),
    priceInPaise,
    foodType: formData.get("foodType"),
    isAvailable: formData.get("isAvailable") === "on",
  })
  if (!parsed.success) {
    return { status: "error", message: "Check the item's details." }
  }

  const accessToken = await getAccessToken()
  if (!accessToken) redirect("/auth")
  const input = parsed.data
  try {
    if (typeof itemId === "string" && itemId) {
      await updateMenuItem(accessToken, restaurantId, itemId, input)
    } else {
      await createMenuItem(accessToken, restaurantId, input)
    }
  } catch (error) {
    return { status: "error", message: errorMessage(error) }
  }
  revalidatePath("/restaurant/menu", "page")
  return { status: "success" }
}

/** Marks an item available or sold out; called directly from a switch. */
export async function toggleMenuItemAvailabilityAction(
  restaurantId: string,
  itemId: string,
  isAvailable: boolean
): Promise<void> {
  const accessToken = await getAccessToken()
  if (!accessToken) redirect("/auth")
  await setMenuItemAvailability(accessToken, restaurantId, itemId, isAvailable)
  revalidatePath("/restaurant/menu", "page")
}

/** Deletes a menu item. */
export async function deleteMenuItemAction(
  restaurantId: string,
  itemId: string
): Promise<void> {
  const accessToken = await getAccessToken()
  if (!accessToken) redirect("/auth")
  await deleteMenuItem(accessToken, restaurantId, itemId)
  revalidatePath("/restaurant/menu", "page")
}
