"use client"

import { useCallback, useState } from "react"

import {
  buildPresignedForm,
  postToS3WithProgress,
} from "@/features/media/upload-to-s3"

import {
  confirmDocumentUploadAction,
  removeDocumentAction,
  requestDocumentUploadAction,
} from "./actions"
import type { DocumentType } from "./constants"
import { validateDocumentFile } from "./validate-document"

export type DocumentUploadStatus = "idle" | "uploading" | "uploaded" | "error"

export interface DocumentFile {
  contentType: string
  size: number
  /** Presigned GET url; short-lived. */
  url: string | null
}

interface DocumentUploadState {
  status: DocumentUploadStatus
  progress: number
  error: string | null
  file: DocumentFile | null
}

const UPLOAD_FAILED = "Upload failed. Please try again."

/**
 * Browser-direct document upload: presign (server action) -> POST to S3 with
 * progress -> confirm (server action). A failed S3 POST removes the pending
 * row; a failed replacement keeps the previous document.
 */
export function useDocumentUpload(
  restaurantId: string,
  type: DocumentType,
  initial: DocumentFile | null
) {
  const [state, setState] = useState<DocumentUploadState>({
    status: initial ? "uploaded" : "idle",
    progress: 0,
    error: null,
    file: initial,
  })

  const fail = useCallback((message: string) => {
    setState((prev) => ({ ...prev, status: "error", error: message }))
  }, [])

  const upload = useCallback(
    async (file: File) => {
      const invalid = validateDocumentFile(file)
      if (invalid) return fail(invalid)

      setState((prev) => ({
        ...prev,
        status: "uploading",
        progress: 0,
        error: null,
      }))

      const presigned = await requestDocumentUploadAction(
        restaurantId,
        type,
        file.type,
        file.size
      )
      if (!presigned.ok) return fail(presigned.message)

      const posted = await postToS3WithProgress(
        presigned.data.url,
        buildPresignedForm(presigned.data.fields, file),
        (progress) => setState((prev) => ({ ...prev, progress }))
      )
      if (!posted) {
        await removeDocumentAction(restaurantId, type)
        return fail(UPLOAD_FAILED)
      }

      const confirmed = await confirmDocumentUploadAction(restaurantId, type)
      if (!confirmed.ok) return fail(confirmed.message)

      setState({
        status: "uploaded",
        progress: 100,
        error: null,
        file: {
          contentType: confirmed.data.contentType,
          size: confirmed.data.size,
          url: confirmed.data.url,
        },
      })
    },
    [restaurantId, type, fail]
  )

  const remove = useCallback(async () => {
    const result = await removeDocumentAction(restaurantId, type)
    if (!result.ok) return fail(result.message)
    setState({ status: "idle", progress: 0, error: null, file: null })
  }, [restaurantId, type, fail])

  return { ...state, upload, remove }
}
