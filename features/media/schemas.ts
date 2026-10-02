import { z } from "zod"

import { ALLOWED_IMAGE_TYPES, IMAGE_KINDS, MAX_UPLOAD_BYTES } from "./constants"

/** Presigned-POST answer from `POST .../uploads`. */
export const presignedUploadSchema = z.object({
  uploadId: z.string(),
  url: z.url(),
  fields: z.record(z.string(), z.string()),
  publicUrl: z.url(),
  expiresAt: z.string(),
})
export type PresignedUpload = z.infer<typeof presignedUploadSchema>

/** Which image slot an upload or removal is for. `itemId` is set only for `menu_item`. */
export const imageTargetSchema = z
  .object({
    restaurantId: z.string().min(1),
    kind: z.enum(IMAGE_KINDS),
    itemId: z.string().min(1).optional(),
  })
  .refine(
    (target) => (target.kind === "menu_item") === Boolean(target.itemId),
    {
      message: "itemId is required for menu items and only for menu items",
    }
  )
export type ImageTarget = z.infer<typeof imageTargetSchema>

export const uploadRequestSchema = z
  .object({
    contentType: z.enum(ALLOWED_IMAGE_TYPES),
    size: z.number().int().positive(),
  })
  .and(z.object({ target: imageTargetSchema }))
  .refine(({ size, target }) => size <= MAX_UPLOAD_BYTES[target.kind], {
    message: "File too large",
  })
