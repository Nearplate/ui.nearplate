import type { OwnerRestaurant } from "@/features/restaurant/schemas"

import {
  BANK_DOCUMENTS,
  DOCUMENT_LABELS,
  IDENTITY_DOCUMENTS,
  KYC_FIELD_LABELS,
  type DocumentType,
  type KycField,
  type OnboardingStep,
} from "./constants"
import type { Kyc, RestaurantDocument } from "./schemas"
import type { DocumentFile } from "./use-document-upload"

export const IDENTITY_KYC_FIELDS: readonly KycField[] = [
  "panNumber",
  "fssaiNumber",
]
export const BANK_KYC_FIELDS: readonly KycField[] = [
  "accountHolderName",
  "accountNumber",
  "ifscCode",
  "bankName",
]

interface ProgressInput {
  restaurant: OwnerRestaurant | null
  kyc: Kyc
  documents: readonly RestaurantDocument[]
}

export interface OnboardingProgress {
  completed: Record<OnboardingStep, boolean>
  firstIncomplete: OnboardingStep
  /** Human labels of everything still needed to submit. */
  missing: string[]
}

function uploadedTypes(
  documents: readonly RestaurantDocument[]
): Set<DocumentType> {
  return new Set(
    documents.filter((doc) => doc.status === "uploaded").map((doc) => doc.type)
  )
}

/** What's left to fill in, derived from the API data (the 409 lists nothing). */
export function onboardingProgress({
  restaurant,
  kyc,
  documents,
}: ProgressInput): OnboardingProgress {
  const uploaded = uploadedTypes(documents)
  const missingDocs = [...IDENTITY_DOCUMENTS, ...BANK_DOCUMENTS].filter(
    (type) => !uploaded.has(type)
  )
  const missingKyc = [...IDENTITY_KYC_FIELDS, ...BANK_KYC_FIELDS].filter(
    (field) => !kyc[field]
  )

  const identityDone =
    IDENTITY_DOCUMENTS.every((type) => uploaded.has(type)) &&
    IDENTITY_KYC_FIELDS.every((field) => kyc[field])
  const bankDone =
    BANK_DOCUMENTS.every((type) => uploaded.has(type)) &&
    BANK_KYC_FIELDS.every((field) => kyc[field])

  const completed = {
    details: restaurant !== null,
    identity: identityDone,
    bank: bankDone,
    review: false,
  }
  const firstIncomplete: OnboardingStep = !completed.details
    ? "details"
    : !completed.identity
      ? "identity"
      : !completed.bank
        ? "bank"
        : "review"

  return {
    completed,
    firstIncomplete,
    missing: [
      ...missingDocs.map((type) => DOCUMENT_LABELS[type]),
      ...missingKyc.map((field) => KYC_FIELD_LABELS[field]),
    ],
  }
}

const STEP_ORDER: readonly OnboardingStep[] = [
  "details",
  "identity",
  "bank",
  "review",
]

/** The requested step, unless it skips past the first incomplete one. */
export function clampStep(
  requested: OnboardingStep | undefined,
  firstIncomplete: OnboardingStep
): OnboardingStep {
  if (!requested) return firstIncomplete
  return STEP_ORDER.indexOf(requested) > STEP_ORDER.indexOf(firstIncomplete)
    ? firstIncomplete
    : requested
}

/** The uploaded file for `type`, in the shape the uploader starts from. */
export function documentFileFor(
  documents: readonly RestaurantDocument[],
  type: DocumentType
): DocumentFile | null {
  const doc = documents.find((d) => d.type === type && d.status === "uploaded")
  return doc
    ? { contentType: doc.contentType, size: doc.size, url: doc.url }
    : null
}
