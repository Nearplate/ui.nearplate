"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { updateMe } from "@/features/auth/api/user-api"
import type { FormActionState } from "@/features/auth/actions"
import { getAccessToken } from "@/features/auth/session"
import { errorMessage } from "@/lib/api/error-message"

import { createAddress, deleteAddress, updateAddress } from "./api/address-api"
import { addressFormSchema, profileFormSchema } from "./schemas"

const INDIAN_MOBILE_LENGTH = 10

function nullableText(value: FormDataEntryValue | null): string | null {
  const text = typeof value === "string" ? value.trim() : ""
  return text === "" ? null : text
}

/** Prefixes the 10 typed digits with +91; anything else is left for the schema to reject. */
function toIndianPhone(value: FormDataEntryValue | null): string {
  const digits = typeof value === "string" ? value.replace(/\D/g, "") : ""
  return digits.length === INDIAN_MOBILE_LENGTH ? `+91${digits}` : digits
}

/** Updates the caller's profile fields. Every field is optional; a blank value clears it. */
export async function updateAccountProfileAction(
  _previous: FormActionState,
  formData: FormData
): Promise<FormActionState> {
  const parsed = profileFormSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phoneNumber: formData.get("phoneNumber"),
    dateOfBirth: formData.get("dateOfBirth"),
    anniversaryDate: formData.get("anniversaryDate"),
    gender: formData.get("gender"),
  })
  if (!parsed.success) {
    return { status: "error", message: "Check your details and try again." }
  }

  const patch = Object.fromEntries(
    Object.entries(parsed.data).filter(([, value]) => value !== undefined)
  )

  const accessToken = await getAccessToken()
  if (!accessToken) redirect("/auth")

  try {
    await updateMe(accessToken, patch)
  } catch (error) {
    return { status: "error", message: errorMessage(error) }
  }
  revalidatePath("/account")
  return { status: "success" }
}

/** Creates or updates one of the caller's addresses, depending on the hidden `addressId`. */
export async function saveAddressAction(
  _previous: FormActionState,
  formData: FormData
): Promise<FormActionState> {
  const addressId = formData.get("addressId")

  const parsed = addressFormSchema.safeParse({
    label: formData.get("label"),
    line1: formData.get("line1"),
    line2: nullableText(formData.get("line2")),
    city: formData.get("city"),
    state: formData.get("state"),
    zipcode: formData.get("zipcode"),
    phoneNumber: toIndianPhone(formData.get("phoneNumber")),
    lat: formData.get("lat"),
    lng: formData.get("lng"),
    isDefault: formData.get("isDefault") === "on",
  })
  if (!parsed.success) {
    return { status: "error", message: "Check the address details." }
  }

  const accessToken = await getAccessToken()
  if (!accessToken) redirect("/auth")

  try {
    if (typeof addressId === "string" && addressId) {
      await updateAddress(accessToken, addressId, parsed.data)
    } else {
      await createAddress(accessToken, parsed.data)
    }
  } catch (error) {
    return { status: "error", message: errorMessage(error) }
  }
  revalidatePath("/account")
  return { status: "success" }
}

/** Deletes one of the caller's addresses. */
export async function deleteAddressAction(addressId: string): Promise<void> {
  const accessToken = await getAccessToken()
  if (!accessToken) redirect("/auth")
  await deleteAddress(accessToken, addressId)
  revalidatePath("/account")
}

/** Marks one address as the caller's default. */
export async function setDefaultAddressAction(
  addressId: string
): Promise<void> {
  const accessToken = await getAccessToken()
  if (!accessToken) redirect("/auth")
  await updateAddress(accessToken, addressId, { isDefault: true })
  revalidatePath("/account")
}
