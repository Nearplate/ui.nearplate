"use client"

import { useCallback, useEffect, useState } from "react"

import {
  cancelUploadAction,
  confirmUploadAction,
  requestUploadAction,
} from "./actions"
import type { ImageTarget } from "./schemas"
import { buildPresignedForm, postToS3 } from "./upload-to-s3"
import { validateImageFile } from "./validate-image"

export type UploadStatus = "idle" | "uploading" | "done" | "error"

interface UseImageUploadOptions {
  /** Called with the confirmed public URL (null if the API didn't return one). */
  onUploaded?: (url: string | null) => void
}

const UPLOAD_FAILED = "Upload failed. Please try again."

/**
 * Browser-direct upload: presign (server action) -> POST to S3 -> confirm
 * (server action). A failed S3 POST cancels the pending upload.
 */
export function useImageUpload(
  target: ImageTarget,
  { onUploaded }: UseImageUploadOptions = {}
) {
  const [status, setStatus] = useState<UploadStatus>("idle")
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const fail = useCallback((message: string) => {
    setStatus("error")
    setError(message)
    setPreviewUrl(null)
  }, [])

  const upload = useCallback(
    async (file: File) => {
      const invalid = validateImageFile(target.kind, file)
      if (invalid) return fail(invalid)

      setError(null)
      setStatus("uploading")
      setPreviewUrl(URL.createObjectURL(file))

      const presigned = await requestUploadAction(target, file.type, file.size)
      if (!presigned.ok) return fail(presigned.message)

      const { uploadId, url, fields } = presigned.data
      const posted = await postToS3(url, buildPresignedForm(fields, file))
      if (!posted) {
        await cancelUploadAction(target, uploadId)
        return fail(UPLOAD_FAILED)
      }

      const confirmed = await confirmUploadAction(target, uploadId)
      if (!confirmed.ok) return fail(confirmed.message)

      setStatus("done")
      onUploaded?.(confirmed.data.url)
    },
    [target, fail, onUploaded]
  )

  const reset = useCallback(() => {
    setStatus("idle")
    setError(null)
    setPreviewUrl(null)
  }, [])

  return { status, error, previewUrl, upload, reset }
}
