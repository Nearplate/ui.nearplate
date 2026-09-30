import { MAX_CARTS, MAX_ITEM_QUANTITY } from "./constants"
import type {
  Cart,
  CartLine,
  MenuItemRef,
  MergeCartsPayload,
  RestaurantRef,
} from "./schemas"

/*
 * Pure, immutable operations over a list of carts. They back the guest cart
 * (localStorage) and the optimistic view of the server cart alike, so the two
 * behave identically. Every function returns a new list, or the same list when
 * nothing changed.
 */

type UnpricedCart = Omit<
  Cart,
  "itemCount" | "subtotalInPaise" | "totalInPaise" | "canCheckout"
>

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0)
}

/** Recomputes line totals, counts and `canCheckout` from the lines. */
function priced(cart: UnpricedCart): Cart {
  const items = cart.items.map((line) => ({
    ...line,
    lineTotalInPaise: line.priceInPaise * line.quantity,
  }))
  const subtotalInPaise = sum(items.map((line) => line.lineTotalInPaise))
  return {
    ...cart,
    items,
    itemCount: sum(items.map((line) => line.quantity)),
    subtotalInPaise,
    totalInPaise: subtotalInPaise,
    canCheckout:
      cart.restaurant.status === "online" &&
      items.length > 0 &&
      items.every((line) => line.isAvailable),
  }
}

/** Most recently touched first, capped at `MAX_CARTS` (the oldest is evicted). */
function newestFirst(carts: Cart[]): Cart[] {
  return [...carts]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, MAX_CARTS)
}

function withoutRestaurant(carts: Cart[], restaurantId: string): Cart[] {
  return carts.filter((cart) => cart.restaurantId !== restaurantId)
}

/** Stores `cart` with fresh totals, moves it to the front and stamps `now`. */
function touched(carts: Cart[], cart: UnpricedCart, now: Date): Cart[] {
  const next = priced({ ...cart, updatedAt: now.toISOString() })
  return newestFirst([next, ...withoutRestaurant(carts, cart.restaurantId)])
}

function findLine(
  carts: Cart[],
  restaurantId: string,
  menuItemId: string
): { cart: Cart; line: CartLine } | null {
  const cart = carts.find((entry) => entry.restaurantId === restaurantId)
  const line = cart?.items.find((entry) => entry.menuItemId === menuItemId)
  return cart && line ? { cart, line } : null
}

/**
 * Adds one of `item`, creating the cart if needed. An unavailable item or an
 * offline restaurant is ignored, and a line never exceeds `MAX_ITEM_QUANTITY`.
 */
export function addItem(
  carts: Cart[],
  restaurant: RestaurantRef,
  item: MenuItemRef,
  now: Date
): Cart[] {
  if (restaurant.status !== "online" || !item.isAvailable) return carts

  const existing = carts.find((cart) => cart.restaurantId === restaurant.id)
  const lines = existing?.items ?? []
  const items = lines.some((line) => line.menuItemId === item.id)
    ? lines.map((line) =>
        line.menuItemId === item.id
          ? {
              ...line,
              quantity: Math.min(line.quantity + 1, MAX_ITEM_QUANTITY),
            }
          : line
      )
    : [
        ...lines,
        {
          menuItemId: item.id,
          name: item.name,
          imageUrl: item.imageUrl,
          priceInPaise: item.priceInPaise,
          quantity: 1,
          lineTotalInPaise: item.priceInPaise,
          isAvailable: item.isAvailable,
        },
      ]

  return touched(
    carts,
    {
      restaurantId: restaurant.id,
      restaurant: {
        name: restaurant.name,
        slug: restaurant.slug,
        status: restaurant.status,
      },
      items,
      updatedAt: now.toISOString(),
    },
    now
  )
}

/** Sets a line's quantity outright; zero or less removes it. */
export function setQuantity(
  carts: Cart[],
  restaurantId: string,
  menuItemId: string,
  quantity: number,
  now: Date
): Cart[] {
  const found = findLine(carts, restaurantId, menuItemId)
  if (!found) return carts
  if (quantity <= 0) return removeItem(carts, restaurantId, menuItemId, now)

  const clamped = Math.min(quantity, MAX_ITEM_QUANTITY)
  return touched(
    carts,
    {
      ...found.cart,
      items: found.cart.items.map((line) =>
        line.menuItemId === menuItemId ? { ...line, quantity: clamped } : line
      ),
    },
    now
  )
}

/** Removes a line; the cart goes with its last line. */
export function removeItem(
  carts: Cart[],
  restaurantId: string,
  menuItemId: string,
  now: Date
): Cart[] {
  const found = findLine(carts, restaurantId, menuItemId)
  if (!found) return carts

  const items = found.cart.items.filter(
    (line) => line.menuItemId !== menuItemId
  )
  if (items.length === 0) return withoutRestaurant(carts, restaurantId)
  return touched(carts, { ...found.cart, items }, now)
}

/** Drops one restaurant's cart. */
export function clearCart(carts: Cart[], restaurantId: string): Cart[] {
  return withoutRestaurant(carts, restaurantId)
}

/**
 * Swaps in the server's version of a cart. `null`, or a cart with no lines,
 * means the cart no longer exists.
 */
export function replaceCart(
  carts: Cart[],
  restaurantId: string,
  cart: Cart | null
): Cart[] {
  const others = withoutRestaurant(carts, restaurantId)
  if (!cart || cart.items.length === 0) return others
  return newestFirst([cart, ...others])
}

/**
 * Re-syncs a guest cart with the restaurant's live menu (name, price,
 * availability), dropping lines that are no longer on it. Returns the same
 * list when nothing changed, so callers can skip a write.
 */
export function refreshCart(
  carts: Cart[],
  restaurant: RestaurantRef,
  menu: MenuItemRef[]
): Cart[] {
  const cart = carts.find((entry) => entry.restaurantId === restaurant.id)
  if (!cart) return carts

  const liveById = new Map(menu.map((item) => [item.id, item]))
  const items = cart.items.flatMap((line) => {
    const live = liveById.get(line.menuItemId)
    return live
      ? [
          {
            ...line,
            name: live.name,
            imageUrl: live.imageUrl,
            priceInPaise: live.priceInPaise,
            isAvailable: live.isAvailable,
          },
        ]
      : []
  })
  if (items.length === 0) return withoutRestaurant(carts, restaurant.id)

  const next = priced({
    ...cart,
    restaurant: {
      name: restaurant.name,
      slug: restaurant.slug,
      status: restaurant.status,
    },
    items,
  })
  if (JSON.stringify(next) === JSON.stringify(cart)) return carts
  return carts.map((entry) => (entry === cart ? next : entry))
}

/** The body of `POST /carts/merge`: ids and quantities only. */
export function toMergePayload(carts: Cart[]): MergeCartsPayload {
  return {
    carts: carts.map((cart) => ({
      restaurantId: cart.restaurantId,
      items: cart.items.map((line) => ({
        menuItemId: line.menuItemId,
        quantity: line.quantity,
      })),
    })),
  }
}
