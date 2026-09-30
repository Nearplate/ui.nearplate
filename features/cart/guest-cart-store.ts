import { GUEST_CART_STORAGE_KEY } from "./constants"
import { guestCartsSchema, type Cart } from "./schemas"

/*
 * localStorage-backed store for a guest's carts, shaped for
 * `useSyncExternalStore`: `getGuestCartsSnapshot` returns the same array
 * reference until the stored value changes, and other tabs are picked up
 * through the `storage` event.
 */

const EMPTY: Cart[] = []
const listeners = new Set<() => void>()

let cachedRaw: string | null = null
let cachedCarts: Cart[] = EMPTY
/** Holds the carts in memory when localStorage is unavailable or full. */
let memoryCarts: Cart[] | null = null

function parse(raw: string | null): Cart[] {
  if (raw === null) return EMPTY
  try {
    const parsed = guestCartsSchema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : EMPTY
  } catch {
    // Corrupt storage is discarded: the guest simply starts with an empty cart.
    return EMPTY
  }
}

function notify(): void {
  listeners.forEach((listener) => listener())
}

/** The guest's carts, most recently touched first. */
export function getGuestCartsSnapshot(): Cart[] {
  if (memoryCarts) return memoryCarts

  let raw: string | null
  try {
    raw = window.localStorage.getItem(GUEST_CART_STORAGE_KEY)
  } catch {
    return EMPTY
  }
  if (raw === cachedRaw) return cachedCarts

  cachedRaw = raw
  cachedCarts = parse(raw)
  return cachedCarts
}

/** Guests have no carts during server rendering. */
export function getGuestCartsServerSnapshot(): Cart[] {
  return EMPTY
}

/** Calls `listener` after any write here or in another tab. */
export function subscribeGuestCarts(listener: () => void): () => void {
  function onStorage(event: StorageEvent): void {
    if (event.key === null || event.key === GUEST_CART_STORAGE_KEY) listener()
  }

  listeners.add(listener)
  window.addEventListener("storage", onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener("storage", onStorage)
  }
}

/** Persists the carts; an empty list removes the key. */
export function writeGuestCarts(carts: Cart[]): void {
  try {
    if (carts.length === 0) {
      window.localStorage.removeItem(GUEST_CART_STORAGE_KEY)
    } else {
      window.localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(carts))
    }
    memoryCarts = null
  } catch {
    // Private mode or a full quota: keep the carts for this page's lifetime.
    memoryCarts = carts.length === 0 ? null : carts
  }
  notify()
}
