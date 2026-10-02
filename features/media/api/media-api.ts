import "server-only"

import { apiRequest } from "@/lib/api/client"
import { menuItemSchema, restaurantSchema } from "@/features/restaurant/schemas"
import type { MenuItem, Restaurant } from "@/features/restaurant/schemas"

import {
  presignedUploadSchema,
  type ImageTarget,
  type PresignedUpload,
} from "../schemas"

/** `/restaurants/:id` for a logo/banner, `/restaurants/:id/menu/items/:itemId` for a dish. */
function basePath({ restaurantId, itemId }: ImageTarget): string {
  const restaurant = `/restaurants/${encodeURIComponent(restaurantId)}`
  return itemId
    ? `${restaurant}/menu/items/${encodeURIComponent(itemId)}`
    : restaurant
}

/** POST .../uploads -- a presigned S3 POST for a new pending upload. */
export async function createImageUpload(
  accessToken: string,
  target: ImageTarget,
  contentType: string,
  size: number
): Promise<PresignedUpload> {
  const body =
    target.kind === "menu_item"
      ? { contentType, size }
      : { kind: target.kind, contentType, size }
  return presignedUploadSchema.parse(
    await apiRequest(`${basePath(target)}/uploads`, {
      method: "POST",
      body,
      token: accessToken,
    })
  )
}

/** POST .../uploads/:uploadId/confirm -- the image now lives on the restaurant / item. */
export async function confirmImageUpload(
  accessToken: string,
  target: ImageTarget,
  uploadId: string
): Promise<Restaurant | MenuItem> {
  const data = await apiRequest(
    `${basePath(target)}/uploads/${encodeURIComponent(uploadId)}/confirm`,
    { method: "POST", token: accessToken }
  )
  return target.itemId
    ? menuItemSchema.parse(data)
    : restaurantSchema.parse(data)
}

/** DELETE .../uploads/:uploadId -- drops a pending upload and its S3 object. */
export async function cancelImageUpload(
  accessToken: string,
  target: ImageTarget,
  uploadId: string
): Promise<void> {
  await apiRequest(
    `${basePath(target)}/uploads/${encodeURIComponent(uploadId)}`,
    {
      method: "DELETE",
      token: accessToken,
    }
  )
}

const URL_FIELD: Record<ImageTarget["kind"], string> = {
  logo: "logoUrl",
  banner: "bannerUrl",
  menu_item: "imageUrl",
}

/** PATCH the slot's URL to null; the API deletes the replaced S3 object. */
export async function clearImage(
  accessToken: string,
  target: ImageTarget
): Promise<void> {
  await apiRequest(basePath(target), {
    method: "PATCH",
    body: { [URL_FIELD[target.kind]]: null },
    token: accessToken,
  })
}
