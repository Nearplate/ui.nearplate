import {
  DOCUMENT_CONTENT_TYPES,
  DOCUMENT_MAX_BYTES,
  DOCUMENT_MAX_MB,
} from "./constants"

const ALLOWED = new Set<string>(DOCUMENT_CONTENT_TYPES)

/** A user-facing message if the file can't be uploaded, else null. */
export function validateDocumentFile(file: File): string | null {
  if (!ALLOWED.has(file.type)) return "Use a PDF, JPG or PNG file."
  if (file.size === 0) return "That file is empty."
  if (file.size > DOCUMENT_MAX_BYTES) {
    return `File is too large. Max ${DOCUMENT_MAX_MB} MB.`
  }
  return null
}
