import "server-only"

import {
  ownerRestaurantSchema,
  type OwnerRestaurant,
} from "@/features/restaurant/schemas"
import { apiRequest } from "@/lib/api/client"

import type { DocumentType, KycField } from "../constants"
import {
  documentListSchema,
  documentSchema,
  kycSchema,
  presignedDocumentSchema,
  type Kyc,
  type PresignedDocument,
  type RestaurantDocument,
} from "../schemas"

function restaurantPath(restaurantId: string): string {
  return `/restaurants/${encodeURIComponent(restaurantId)}`
}

function documentPath(restaurantId: string, type?: DocumentType): string {
  const base = `${restaurantPath(restaurantId)}/documents`
  return type ? `${base}/${encodeURIComponent(type)}` : base
}

/** GET /restaurants/:id/kyc -- PAN and account number come back masked. */
export async function getKyc(
  accessToken: string,
  restaurantId: string
): Promise<Kyc> {
  return kycSchema.parse(
    await apiRequest(`${restaurantPath(restaurantId)}/kyc`, {
      token: accessToken,
    })
  )
}

/** PATCH /restaurants/:id/kyc -- only the fields given are changed. */
export async function updateKyc(
  accessToken: string,
  restaurantId: string,
  patch: Partial<Record<KycField, string>>
): Promise<Kyc> {
  return kycSchema.parse(
    await apiRequest(`${restaurantPath(restaurantId)}/kyc`, {
      method: "PATCH",
      body: patch,
      token: accessToken,
    })
  )
}

/** GET /restaurants/:id/documents -- uploaded ones carry a short-lived GET url. */
export async function listDocuments(
  accessToken: string,
  restaurantId: string
): Promise<RestaurantDocument[]> {
  return documentListSchema.parse(
    await apiRequest(documentPath(restaurantId), { token: accessToken })
  ).items
}

/** POST /restaurants/:id/documents -- presigned S3 POST for one document type. */
export async function createDocumentUpload(
  accessToken: string,
  restaurantId: string,
  type: DocumentType,
  contentType: string,
  size: number
): Promise<PresignedDocument> {
  return presignedDocumentSchema.parse(
    await apiRequest(documentPath(restaurantId), {
      method: "POST",
      body: { type, contentType, size },
      token: accessToken,
    })
  )
}

/** POST .../documents/:type/confirm -- verifies the object landed in S3. */
export async function confirmDocumentUpload(
  accessToken: string,
  restaurantId: string,
  type: DocumentType
): Promise<RestaurantDocument> {
  return documentSchema.parse(
    await apiRequest(`${documentPath(restaurantId, type)}/confirm`, {
      method: "POST",
      token: accessToken,
    })
  )
}

/** DELETE .../documents/:type -- also drops a pending row. */
export async function deleteDocument(
  accessToken: string,
  restaurantId: string,
  type: DocumentType
): Promise<void> {
  await apiRequest(documentPath(restaurantId, type), {
    method: "DELETE",
    token: accessToken,
  })
}

/** POST /restaurants/:id/submit -- draft/rejected -> pending_review. */
export async function submitForReview(
  accessToken: string,
  restaurantId: string
): Promise<OwnerRestaurant> {
  return ownerRestaurantSchema.parse(
    await apiRequest(`${restaurantPath(restaurantId)}/submit`, {
      method: "POST",
      token: accessToken,
    })
  )
}
