import { ApiError } from "./client"

const HTTP_BAD_REQUEST = 400
const HTTP_UNAUTHORIZED = 401
const HTTP_NOT_FOUND = 404
const HTTP_TOO_MANY_REQUESTS = 429
const HTTP_CONFLICT = 409
const HTTP_NOT_IMPLEMENTED = 501

const CODE_MESSAGES: Record<string, string> = {
  RESTAURANT_ONBOARDING_LOCKED:
    "Your details are under review and can't be changed.",
  RESTAURANT_INCOMPLETE: "Some details are still missing.",
  RESTAURANT_VERIFICATION_TRANSITION_NOT_ALLOWED:
    "This restaurant has already been submitted.",
  RESTAURANT_DOCUMENT_UPLOAD_MISMATCH: "Upload didn't complete. Try again.",
}

/** User-facing text for an API failure. Unexpected errors are rethrown. */
export function errorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    throw error
  }
  const byCode = error.code ? CODE_MESSAGES[error.code] : undefined
  if (byCode) return byCode
  switch (error.status) {
    case HTTP_BAD_REQUEST:
      return "Check your details and try again."
    case HTTP_UNAUTHORIZED:
      return "Sign-in failed. The link may have expired; request a new one."
    case HTTP_NOT_FOUND:
      return "Not found. It may have been removed."
    case HTTP_TOO_MANY_REQUESTS:
      return "Too many attempts. Try again in an hour."
    case HTTP_CONFLICT:
      return "That change conflicts with the current state. Refresh and try again."
    case HTTP_NOT_IMPLEMENTED:
      return "This sign-in method isn't available right now."
    default:
      return "Something went wrong. Please try again."
  }
}
