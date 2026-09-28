import { ApiError } from "./client"

const HTTP_BAD_REQUEST = 400
const HTTP_UNAUTHORIZED = 401
const HTTP_NOT_FOUND = 404
const HTTP_TOO_MANY_REQUESTS = 429
const HTTP_NOT_IMPLEMENTED = 501

/** User-facing text for an API failure. Unexpected errors are rethrown. */
export function errorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    throw error
  }
  switch (error.status) {
    case HTTP_BAD_REQUEST:
      return "Check your details and try again."
    case HTTP_UNAUTHORIZED:
      return "Sign-in failed. The link may have expired; request a new one."
    case HTTP_NOT_FOUND:
      return "Not found. It may have been removed."
    case HTTP_TOO_MANY_REQUESTS:
      return "Too many attempts. Try again in an hour."
    case HTTP_NOT_IMPLEMENTED:
      return "This sign-in method isn't available right now."
    default:
      return "Something went wrong. Please try again."
  }
}
