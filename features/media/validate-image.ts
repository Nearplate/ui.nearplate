import {
  ALLOWED_IMAGE_TYPES,
  MAX_UPLOAD_BYTES,
  type AllowedImageType,
  type ImageKind,
} from "./constants"

const BYTES_PER_MB = 1024 * 1024

function isAllowedType(type: string): type is AllowedImageType {
  return (ALLOWED_IMAGE_TYPES as readonly string[]).includes(type)
}

/** A user-facing reason the file can't be uploaded for `kind`, or null if it can. */
export function validateImageFile(
  kind: ImageKind,
  file: Pick<File, "type" | "size">
): string | null {
  if (!isAllowedType(file.type)) return "Use a JPG, PNG or WebP image."
  if (file.size <= 0) return "That file is empty."
  const max = MAX_UPLOAD_BYTES[kind]
  if (file.size > max) {
    return `Image must be ${max / BYTES_PER_MB} MB or smaller.`
  }
  return null
}
