const ONE_MB = 1024 * 1024

/** Mirrors `api.nearplate/src/domain/constants/upload.ts`. */
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const

export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number]

export const IMAGE_KINDS = ["logo", "banner", "menu_item"] as const
export type ImageKind = (typeof IMAGE_KINDS)[number]

export const MAX_UPLOAD_BYTES: Record<ImageKind, number> = {
  logo: 2 * ONE_MB,
  banner: 5 * ONE_MB,
  menu_item: 3 * ONE_MB,
}

export const IMAGE_ACCEPT = ALLOWED_IMAGE_TYPES.join(",")
