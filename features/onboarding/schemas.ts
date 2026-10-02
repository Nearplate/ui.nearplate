import { z } from "zod"

import { DOCUMENT_TYPES, ONBOARDING_STEPS, type KycField } from "./constants"

export const stepSchema = z.enum(ONBOARDING_STEPS)
export const documentTypeSchema = z.enum(DOCUMENT_TYPES)

/** `GET/PATCH :id/kyc`. PAN and account number come back masked. */
export const kycSchema = z.object({
  panNumber: z.string().nullable(),
  fssaiNumber: z.string().nullable(),
  accountHolderName: z.string().nullable(),
  accountNumber: z.string().nullable(),
  ifscCode: z.string().nullable(),
  bankName: z.string().nullable(),
  updatedAt: z.string().nullable(),
})
export type Kyc = z.infer<typeof kycSchema>

export const EMPTY_KYC: Kyc = {
  panNumber: null,
  fssaiNumber: null,
  accountHolderName: null,
  accountNumber: null,
  ifscCode: null,
  bankName: null,
  updatedAt: null,
}

export const documentSchema = z.object({
  type: documentTypeSchema,
  status: z.enum(["pending", "uploaded"]),
  contentType: z.string(),
  size: z.number(),
  /** Presigned GET, short-lived. Null until uploaded. */
  url: z.string().nullable(),
  updatedAt: z.string(),
})
export type RestaurantDocument = z.infer<typeof documentSchema>

export const documentListSchema = z.object({ items: z.array(documentSchema) })

export const presignedDocumentSchema = z.object({
  type: documentTypeSchema,
  url: z.url(),
  fields: z.record(z.string(), z.string()),
  expiresAt: z.string(),
})
export type PresignedDocument = z.infer<typeof presignedDocumentSchema>

export const documentRequestSchema = z.object({
  restaurantId: z.string().min(1),
  type: documentTypeSchema,
  contentType: z.string(),
  size: z.number().int().positive(),
})

const PAN_PATTERN = /^[A-Z]{5}[0-9]{4}[A-Z]$/
const FSSAI_PATTERN = /^\d{14}$/
const ACCOUNT_PATTERN = /^\d{9,18}$/
const IFSC_PATTERN = /^[A-Z]{4}0[A-Z0-9]{6}$/
const MAX_NAME = 100

/** An absent, empty or blank field means "unchanged". */
function optionalText<T extends z.ZodType<string>>(schema: T) {
  return z.preprocess(
    (value) =>
      value === null || (typeof value === "string" && value.trim() === "")
        ? undefined
        : value,
    schema.optional()
  )
}

const pan = z
  .string()
  .trim()
  .toUpperCase()
  .regex(PAN_PATTERN, "Enter a valid PAN, like ABCDE1234F.")
const fssai = z
  .string()
  .trim()
  .regex(FSSAI_PATTERN, "Enter the 14-digit FSSAI licence number.")
const holder = z.string().trim().min(1).max(MAX_NAME)
const account = z
  .string()
  .trim()
  .regex(ACCOUNT_PATTERN, "Enter 9 to 18 digits.")
const ifsc = z
  .string()
  .trim()
  .toUpperCase()
  .regex(IFSC_PATTERN, "Enter a valid IFSC, like HDFC0001234.")
const bank = z.string().trim().min(1).max(MAX_NAME)

export const identityFormSchema = z.object({
  panNumber: optionalText(pan),
  fssaiNumber: optionalText(fssai),
})
export type IdentityForm = z.infer<typeof identityFormSchema>

export const bankFormSchema = z
  .object({
    accountHolderName: optionalText(holder),
    accountNumber: optionalText(account),
    confirmAccountNumber: optionalText(z.string()),
    ifscCode: optionalText(ifsc),
    bankName: optionalText(bank),
  })
  .refine(
    ({ accountNumber, confirmAccountNumber }) =>
      accountNumber === confirmAccountNumber,
    { path: ["confirmAccountNumber"], message: "Account numbers don't match." }
  )
export type BankForm = z.infer<typeof bankFormSchema>

/** Fields the owner must supply because nothing is saved for them yet. */
export function missingKycFields(
  saved: Kyc,
  provided: Partial<Record<KycField, string | undefined>>,
  required: readonly KycField[]
): KycField[] {
  return required.filter((field) => !saved[field] && !provided[field])
}
