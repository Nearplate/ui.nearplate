"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { getAccessToken } from "@/features/auth/session"
import { errorMessage } from "@/lib/api/error-message"

import {
  cancelImageUpload,
  clearImage,
  confirmImageUpload,
  createImageUpload,
} from "./api/media-api"
import {
  imageTargetSchema,
  uploadRequestSchema,
  type ImageTarget,
  type PresignedUpload,
} from "./schemas"

export type MediaResult<T = undefined> =
  { ok: true; data: T } | { ok: false; message: string }

const INVALID_REQUEST: MediaResult<never> = {
  ok: false,
  message: "Check the image and try again.",
}

async function requireToken(): Promise<string> {
  const accessToken = await getAccessToken()
  if (!accessToken) redirect("/auth")
  return accessToken
}

function revalidateMedia(): void {
  revalidatePath("/restaurant", "layout")
  revalidatePath("/", "layout")
}

/** Step 1: ask the API for a presigned S3 POST for a new image. */
export async function requestUploadAction(
  target: ImageTarget,
  contentType: string,
  size: number
): Promise<MediaResult<PresignedUpload>> {
  const parsed = uploadRequestSchema.safeParse({ target, contentType, size })
  if (!parsed.success) return INVALID_REQUEST
  const accessToken = await requireToken()
  try {
    const data = await createImageUpload(
      accessToken,
      parsed.data.target,
      parsed.data.contentType,
      parsed.data.size
    )
    return { ok: true, data }
  } catch (error) {
    return { ok: false, message: errorMessage(error) }
  }
}

/** Step 3: after the browser has POSTed to S3, make the image live. */
export async function confirmUploadAction(
  target: ImageTarget,
  uploadId: string
): Promise<MediaResult<{ url: string | null }>> {
  const parsed = imageTargetSchema.safeParse(target)
  if (!parsed.success || !uploadId) return INVALID_REQUEST
  const accessToken = await requireToken()
  try {
    const result = await confirmImageUpload(accessToken, parsed.data, uploadId)
    revalidateMedia()
    const url =
      "imageUrl" in result
        ? result.imageUrl
        : parsed.data.kind === "logo"
          ? result.logoUrl
          : result.bannerUrl
    return { ok: true, data: { url } }
  } catch (error) {
    return { ok: false, message: errorMessage(error) }
  }
}

/** Throws a pending upload away (e.g. the S3 POST failed). Best effort. */
export async function cancelUploadAction(
  target: ImageTarget,
  uploadId: string
): Promise<MediaResult> {
  const parsed = imageTargetSchema.safeParse(target)
  if (!parsed.success || !uploadId) return INVALID_REQUEST
  const accessToken = await requireToken()
  try {
    await cancelImageUpload(accessToken, parsed.data, uploadId)
    return { ok: true, data: undefined }
  } catch (error) {
    return { ok: false, message: errorMessage(error) }
  }
}

/** Removes the current image so the default shows again. */
export async function removeImageAction(
  target: ImageTarget
): Promise<MediaResult> {
  const parsed = imageTargetSchema.safeParse(target)
  if (!parsed.success) return INVALID_REQUEST
  const accessToken = await requireToken()
  try {
    await clearImage(accessToken, parsed.data)
    revalidateMedia()
    return { ok: true, data: undefined }
  } catch (error) {
    return { ok: false, message: errorMessage(error) }
  }
}
