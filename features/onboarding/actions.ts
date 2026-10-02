"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

import { onboard } from "@/features/auth/api/user-api"
import { getAccessToken, getSession } from "@/features/auth/session"
import {
  createRestaurant,
  updateRestaurant,
} from "@/features/restaurant/api/restaurant-api"
import { parseCuisines } from "@/features/restaurant/cuisines"
import {
  addressFormSchema,
  createRestaurantFormSchema,
  nameFormSchema,
  updateRestaurantFormSchema,
} from "@/features/restaurant/schemas"
import { errorMessage } from "@/lib/api/error-message"

import {
  confirmDocumentUpload,
  createDocumentUpload,
  deleteDocument,
  getKyc,
  listDocuments,
  submitForReview,
  updateKyc,
} from "./api/onboarding-api"
import {
  BANK_DOCUMENTS,
  IDENTITY_DOCUMENTS,
  KYC_FIELD_LABELS,
  REVIEW_PATH,
  stepHref,
  type DocumentType,
  type KycField,
} from "./constants"
import type { OnboardingFormState } from "./form-state"
import { BANK_KYC_FIELDS, IDENTITY_KYC_FIELDS } from "./progress"
import {
  bankFormSchema,
  documentRequestSchema,
  documentTypeSchema,
  identityFormSchema,
  missingKycFields,
  type PresignedDocument,
  type RestaurantDocument,
} from "./schemas"

export type DocumentResult<T = undefined> =
  { ok: true; data: T } | { ok: false; message: string }

const INVALID_DETAILS = "Check your details and try again."
const INVALID_DOCUMENT: DocumentResult<never> = {
  ok: false,
  message: "Check the file and try again.",
}

async function requireToken(): Promise<string> {
  const accessToken = await getAccessToken()
  if (!accessToken) redirect("/auth")
  return accessToken
}

function formError(
  message: string,
  fieldErrors?: Partial<Record<string, string>>
): OnboardingFormState {
  return { status: "error", message, fieldErrors }
}

function textField(formData: FormData, name: string): string {
  const value = formData.get(name)
  return typeof value === "string" ? value : ""
}

/** `""` from an emptied optional text field means "clear it" -> `null`. */
function nullableText(value: string): string | null {
  const text = value.trim()
  return text === "" ? null : text
}

/** First Zod message per input name, for `Field error`. */
function fieldErrorsOf(error: z.ZodError): Partial<Record<string, string>> {
  const errors: Partial<Record<string, string>> = {}
  for (const issue of error.issues) {
    const name = String(issue.path[0] ?? "")
    if (name && !errors[name]) errors[name] = issue.message
  }
  return errors
}

function revalidateOnboarding(): void {
  revalidatePath("/restaurant", "layout")
}

function addressFromForm(formData: FormData) {
  return {
    line1: formData.get("line1"),
    line2: nullableText(textField(formData, "line2")),
    city: formData.get("city"),
    state: formData.get("state"),
    zipcode: formData.get("zipcode"),
    phoneNumber: formData.get("phoneNumber"),
  }
}

async function ensureOwnerName(formData: FormData): Promise<boolean> {
  const user = await getSession()
  if (!user) redirect("/auth")
  if (user.isOnboarded) return true
  const names = z
    .object({ firstName: nameFormSchema, lastName: nameFormSchema })
    .safeParse({
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
    })
  if (!names.success) return false
  await onboard(await requireToken(), names.data)
  return true
}

/** Step 1: creates the draft restaurant, or updates it when `restaurantId` is set. */
export async function saveDetailsAction(
  _previous: OnboardingFormState,
  formData: FormData
): Promise<OnboardingFormState> {
  const restaurantId = textField(formData, "restaurantId")
  const shared = {
    name: formData.get("name"),
    cuisines: parseCuisines(textField(formData, "cuisines")),
    isPureVeg: formData.get("isPureVeg") === "on",
    description: nullableText(textField(formData, "description")),
    coordinates: [Number(formData.get("lng")), Number(formData.get("lat"))],
    address: addressFromForm(formData),
  }
  const parsed = restaurantId
    ? updateRestaurantFormSchema
        .extend({ address: addressFormSchema })
        .safeParse(shared)
    : createRestaurantFormSchema.safeParse(shared)
  if (!parsed.success) return formError(INVALID_DETAILS)

  try {
    if (!(await ensureOwnerName(formData))) return formError(INVALID_DETAILS)
    const accessToken = await requireToken()
    if (restaurantId) {
      await updateRestaurant(accessToken, restaurantId, parsed.data)
    } else {
      await createRestaurant(
        accessToken,
        createRestaurantFormSchema.parse(parsed.data)
      )
    }
  } catch (error) {
    return formError(errorMessage(error))
  }
  revalidateOnboarding()
  redirect(stepHref("identity"))
}

function notUploaded(
  required: readonly DocumentType[],
  documents: readonly RestaurantDocument[]
): DocumentType[] {
  const uploaded = new Set(
    documents.filter((doc) => doc.status === "uploaded").map((d) => d.type)
  )
  return required.filter((type) => !uploaded.has(type))
}

function nonEmptyEntries(
  values: Record<string, string | undefined>
): Partial<Record<KycField, string>> {
  return Object.fromEntries(
    Object.entries(values).filter(([, value]) => value !== undefined)
  )
}

async function saveKycStep(options: {
  restaurantId: string
  required: readonly KycField[]
  documents: readonly DocumentType[]
  provided: Record<string, string | undefined>
  next: string
}): Promise<OnboardingFormState> {
  const { restaurantId, required, documents, provided, next } = options
  try {
    const accessToken = await requireToken()
    const [saved, uploaded] = await Promise.all([
      getKyc(accessToken, restaurantId),
      listDocuments(accessToken, restaurantId),
    ])
    const missingFields = missingKycFields(saved, provided, required)
    if (missingFields.length > 0) {
      return formError(
        "Some details are still missing.",
        Object.fromEntries(
          missingFields.map((field) => [
            field,
            `${KYC_FIELD_LABELS[field]} is required.`,
          ])
        )
      )
    }
    if (notUploaded(documents, uploaded).length > 0) {
      return formError("Upload every document on this step to continue.")
    }
    const patch = nonEmptyEntries(provided)
    if (Object.keys(patch).length > 0) {
      await updateKyc(accessToken, restaurantId, patch)
    }
  } catch (error) {
    return formError(errorMessage(error))
  }
  revalidateOnboarding()
  redirect(next)
}

/** Step 2: PAN + FSSAI numbers (documents are uploaded separately). */
export async function saveIdentityAction(
  _previous: OnboardingFormState,
  formData: FormData
): Promise<OnboardingFormState> {
  const restaurantId = textField(formData, "restaurantId")
  if (!restaurantId) return formError("Missing restaurant.")
  const parsed = identityFormSchema.safeParse({
    panNumber: formData.get("panNumber"),
    fssaiNumber: formData.get("fssaiNumber"),
  })
  if (!parsed.success) {
    return formError(INVALID_DETAILS, fieldErrorsOf(parsed.error))
  }
  return saveKycStep({
    restaurantId,
    required: IDENTITY_KYC_FIELDS,
    documents: IDENTITY_DOCUMENTS,
    provided: parsed.data,
    next: stepHref("bank"),
  })
}

/** Step 3: bank details (the proof document is uploaded separately). */
export async function saveBankAction(
  _previous: OnboardingFormState,
  formData: FormData
): Promise<OnboardingFormState> {
  const restaurantId = textField(formData, "restaurantId")
  if (!restaurantId) return formError("Missing restaurant.")
  const parsed = bankFormSchema.safeParse({
    accountHolderName: formData.get("accountHolderName"),
    accountNumber: formData.get("accountNumber"),
    confirmAccountNumber: formData.get("confirmAccountNumber"),
    ifscCode: formData.get("ifscCode"),
    bankName: formData.get("bankName"),
  })
  if (!parsed.success) {
    return formError(INVALID_DETAILS, fieldErrorsOf(parsed.error))
  }
  const provided = {
    accountHolderName: parsed.data.accountHolderName,
    accountNumber: parsed.data.accountNumber,
    ifscCode: parsed.data.ifscCode,
    bankName: parsed.data.bankName,
  }
  return saveKycStep({
    restaurantId,
    required: BANK_KYC_FIELDS,
    documents: BANK_DOCUMENTS,
    provided,
    next: stepHref("review"),
  })
}

/** Step 1 of an upload: presigned S3 POST for one document type. */
export async function requestDocumentUploadAction(
  restaurantId: string,
  type: DocumentType,
  contentType: string,
  size: number
): Promise<DocumentResult<PresignedDocument>> {
  const parsed = documentRequestSchema.safeParse({
    restaurantId,
    type,
    contentType,
    size,
  })
  if (!parsed.success) return INVALID_DOCUMENT
  const accessToken = await requireToken()
  try {
    const data = await createDocumentUpload(
      accessToken,
      parsed.data.restaurantId,
      parsed.data.type,
      parsed.data.contentType,
      parsed.data.size
    )
    return { ok: true, data }
  } catch (error) {
    return { ok: false, message: errorMessage(error) }
  }
}

/** Step 3 of an upload: after the S3 POST, make the document count. */
export async function confirmDocumentUploadAction(
  restaurantId: string,
  type: DocumentType
): Promise<DocumentResult<RestaurantDocument>> {
  if (!restaurantId || !documentTypeSchema.safeParse(type).success) {
    return INVALID_DOCUMENT
  }
  const accessToken = await requireToken()
  try {
    const data = await confirmDocumentUpload(accessToken, restaurantId, type)
    revalidateOnboarding()
    return { ok: true, data }
  } catch (error) {
    return { ok: false, message: errorMessage(error) }
  }
}

/** Removes a document (also cleans up a failed upload's pending row). */
export async function removeDocumentAction(
  restaurantId: string,
  type: DocumentType
): Promise<DocumentResult> {
  if (!restaurantId || !documentTypeSchema.safeParse(type).success) {
    return INVALID_DOCUMENT
  }
  const accessToken = await requireToken()
  try {
    await deleteDocument(accessToken, restaurantId, type)
    revalidateOnboarding()
    return { ok: true, data: undefined }
  } catch (error) {
    return { ok: false, message: errorMessage(error) }
  }
}

/** Final step: sends the restaurant for admin review. */
export async function submitForReviewAction(
  _previous: OnboardingFormState,
  formData: FormData
): Promise<OnboardingFormState> {
  const restaurantId = textField(formData, "restaurantId")
  if (!restaurantId) return formError("Missing restaurant.")
  const accessToken = await requireToken()
  try {
    await submitForReview(accessToken, restaurantId)
  } catch (error) {
    return formError(errorMessage(error))
  }
  revalidateOnboarding()
  redirect(REVIEW_PATH)
}
