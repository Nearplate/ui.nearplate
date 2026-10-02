import "server-only"

import { apiRequest } from "@/lib/api/client"

import type {
  CreateRestaurantForm,
  MenuItemForm,
  RestaurantStatus,
  UpdateRestaurantForm,
} from "../schemas"
import {
  menuItemSchema,
  qrCodeSchema,
  ownerRestaurantSchema,
  restaurantSchema,
  type MenuItem,
  type OwnerRestaurant,
  type QrCode,
  type Restaurant,
} from "../schemas"

const MENU_PAGE_SIZE = 100

/** GET /restaurants/:slug (public; an offline restaurant is still returned). */
export async function getPublicRestaurant(slug: string): Promise<Restaurant> {
  return restaurantSchema.parse(
    await apiRequest(`/restaurants/${encodeURIComponent(slug)}`)
  )
}

/** GET /restaurants/:slug/menu (public), sorted by category then name. */
export async function getPublicMenu(slug: string): Promise<MenuItem[]> {
  const data = (await apiRequest(
    `/restaurants/${encodeURIComponent(slug)}/menu`
  )) as { items: unknown[] }
  return data.items.map((item) => menuItemSchema.parse(item))
}

/** GET /restaurants/mine?limit=1 (one owner per account, in this panel). */
export async function listMine(
  accessToken: string
): Promise<OwnerRestaurant[]> {
  const data = (await apiRequest("/restaurants/mine?limit=1", {
    token: accessToken,
  })) as { items: unknown[] }
  return data.items.map((item) => ownerRestaurantSchema.parse(item))
}

/** POST /restaurants */
export async function createRestaurant(
  accessToken: string,
  input: CreateRestaurantForm
): Promise<OwnerRestaurant> {
  return ownerRestaurantSchema.parse(
    await apiRequest("/restaurants", {
      method: "POST",
      body: input,
      token: accessToken,
    })
  )
}

/** PATCH /restaurants/:id */
export async function updateRestaurant(
  accessToken: string,
  id: string,
  patch: UpdateRestaurantForm
): Promise<OwnerRestaurant> {
  return ownerRestaurantSchema.parse(
    await apiRequest(`/restaurants/${id}`, {
      method: "PATCH",
      body: patch,
      token: accessToken,
    })
  )
}

/** PATCH /restaurants/:id/status */
export async function setStatus(
  accessToken: string,
  id: string,
  status: RestaurantStatus
): Promise<OwnerRestaurant> {
  return ownerRestaurantSchema.parse(
    await apiRequest(`/restaurants/${id}/status`, {
      method: "PATCH",
      body: { status },
      token: accessToken,
    })
  )
}

/** GET /restaurants/:id/qr-code */
export async function getQrCode(
  accessToken: string,
  id: string
): Promise<QrCode> {
  return qrCodeSchema.parse(
    await apiRequest(`/restaurants/${id}/qr-code`, { token: accessToken })
  )
}

/** GET /restaurants/:id/menu/items, paged through until every item is read. */
export async function listMenuItems(
  accessToken: string,
  restaurantId: string
): Promise<MenuItem[]> {
  const items: MenuItem[] = []
  let offset = 0
  for (;;) {
    const data = (await apiRequest(
      `/restaurants/${restaurantId}/menu/items?limit=${MENU_PAGE_SIZE}&offset=${offset}`,
      { token: accessToken }
    )) as { items: unknown[]; total: number }
    items.push(...data.items.map((item) => menuItemSchema.parse(item)))
    offset += MENU_PAGE_SIZE
    if (items.length >= data.total || data.items.length === 0) break
  }
  return items
}

/** POST /restaurants/:id/menu/items */
export async function createMenuItem(
  accessToken: string,
  restaurantId: string,
  input: MenuItemForm
): Promise<MenuItem> {
  return menuItemSchema.parse(
    await apiRequest(`/restaurants/${restaurantId}/menu/items`, {
      method: "POST",
      body: input,
      token: accessToken,
    })
  )
}

/** PATCH /restaurants/:id/menu/items/:itemId */
export async function updateMenuItem(
  accessToken: string,
  restaurantId: string,
  itemId: string,
  patch: Partial<MenuItemForm>
): Promise<MenuItem> {
  return menuItemSchema.parse(
    await apiRequest(`/restaurants/${restaurantId}/menu/items/${itemId}`, {
      method: "PATCH",
      body: patch,
      token: accessToken,
    })
  )
}

/** PATCH /restaurants/:id/menu/items/:itemId/availability */
export async function setMenuItemAvailability(
  accessToken: string,
  restaurantId: string,
  itemId: string,
  isAvailable: boolean
): Promise<MenuItem> {
  return menuItemSchema.parse(
    await apiRequest(
      `/restaurants/${restaurantId}/menu/items/${itemId}/availability`,
      { method: "PATCH", body: { isAvailable }, token: accessToken }
    )
  )
}

/** DELETE /restaurants/:id/menu/items/:itemId */
export async function deleteMenuItem(
  accessToken: string,
  restaurantId: string,
  itemId: string
): Promise<void> {
  await apiRequest(`/restaurants/${restaurantId}/menu/items/${itemId}`, {
    method: "DELETE",
    token: accessToken,
  })
}
