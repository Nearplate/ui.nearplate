export const DOCUMENT_TYPES = [
  "aadhaar_front",
  "aadhaar_back",
  "pan_front",
  "pan_back",
  "fssai_certificate",
  "bank_proof",
] as const
export type DocumentType = (typeof DOCUMENT_TYPES)[number]

export const DOCUMENT_LABELS: Record<DocumentType, string> = {
  aadhaar_front: "Aadhaar · front",
  aadhaar_back: "Aadhaar · back",
  pan_front: "PAN · front",
  pan_back: "PAN · back",
  fssai_certificate: "FSSAI certificate",
  bank_proof: "Bank proof",
}

export const IDENTITY_DOCUMENTS: readonly DocumentType[] = [
  "aadhaar_front",
  "aadhaar_back",
  "pan_front",
  "pan_back",
  "fssai_certificate",
]
export const BANK_DOCUMENTS: readonly DocumentType[] = ["bank_proof"]

export const DOCUMENT_CONTENT_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
] as const
export const DOCUMENT_ACCEPT = DOCUMENT_CONTENT_TYPES.join(",")

const BYTES_PER_MB = 1024 * 1024
export const DOCUMENT_MAX_MB = 5
export const DOCUMENT_MAX_BYTES = DOCUMENT_MAX_MB * BYTES_PER_MB

export const ONBOARDING_STEPS = [
  "details",
  "identity",
  "bank",
  "review",
] as const
export type OnboardingStep = (typeof ONBOARDING_STEPS)[number]

export const STEP_LABELS: Record<OnboardingStep, string> = {
  details: "Details",
  identity: "Identity",
  bank: "Bank",
  review: "Review",
}

export const ONBOARDING_PATH = "/restaurant/onboarding"
export const REVIEW_PATH = "/restaurant/onboarding/review"
export const PANEL_PATH = "/restaurant"

export function stepHref(step: OnboardingStep): string {
  return `${ONBOARDING_PATH}?step=${step}`
}

export const KYC_FIELD_LABELS = {
  panNumber: "PAN number",
  fssaiNumber: "FSSAI licence number",
  accountHolderName: "Account holder name",
  accountNumber: "Account number",
  ifscCode: "IFSC code",
  bankName: "Bank name",
} as const
export type KycField = keyof typeof KYC_FIELD_LABELS
