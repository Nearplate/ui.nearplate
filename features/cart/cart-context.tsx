"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react"

import { notifyError } from "@/lib/toast"

import {
  addToCartAction,
  clearCartAction,
  mergeGuestCartsAction,
  removeCartItemAction,
  setCartItemQuantityAction,
  type CartActionResult,
} from "./actions"
import {
  addItem,
  clearCart,
  refreshCart,
  removeItem,
  replaceCart,
  setQuantity,
  toMergePayload,
} from "./cart-state"
import { MAX_ITEM_QUANTITY } from "./constants"
import {
  getGuestCartsServerSnapshot,
  getGuestCartsSnapshot,
  subscribeGuestCarts,
  writeGuestCarts,
} from "./guest-cart-store"
import type { Cart, MenuItemRef, RestaurantRef } from "./schemas"

/**
 * Where the carts live: `server` for a signed-in customer (API, with an
 * optimistic local copy), `guest` for a visitor (localStorage), `disabled`
 * for accounts that cannot order (restaurants, admins).
 */
export type CartMode = "server" | "guest" | "disabled"

interface CartContextValue {
  mode: CartMode
  carts: Cart[]
  itemCount: number
  cartFor: (restaurantId: string) => Cart | undefined
  quantityOf: (restaurantId: string, menuItemId: string) => number
  /** Adds one of `item`, creating the cart if needed. */
  add: (restaurant: RestaurantRef, item: MenuItemRef) => void
  /** Sets a line's quantity outright; zero removes it. */
  setItemQuantity: (
    restaurantId: string,
    menuItemId: string,
    quantity: number
  ) => void
  removeLine: (restaurantId: string, menuItemId: string) => void
  /** Deletes a restaurant's cart everywhere. */
  clear: (restaurantId: string) => void
  /** Drops a cart from this browser's view only (after checkout consumed it). */
  forget: (restaurantId: string) => void
  /** Re-syncs a guest cart with the restaurant's live menu. No-op otherwise. */
  syncMenu: (restaurant: RestaurantRef, menu: MenuItemRef[]) => void
}

const CartContext = createContext<CartContextValue | null>(null)
const NO_CARTS: Cart[] = []

function quantityIn(
  carts: Cart[],
  restaurantId: string,
  menuItemId: string
): number {
  return (
    carts
      .find((cart) => cart.restaurantId === restaurantId)
      ?.items.find((line) => line.menuItemId === menuItemId)?.quantity ?? 0
  )
}

/** Applies a pure change to the persisted guest carts, skipping no-op writes. */
function updateGuestCarts(change: (carts: Cart[]) => Cart[]): void {
  const current = getGuestCartsSnapshot()
  const next = change(current)
  if (next !== current) writeGuestCarts(next)
}

interface CartProviderProps {
  mode: CartMode
  /** The signed-in customer's carts as loaded by the server (`server` mode). */
  initialCarts?: Cart[]
  children: ReactNode
}

export function CartProvider({
  mode,
  initialCarts = NO_CARTS,
  children,
}: CartProviderProps) {
  const guestCarts = useSyncExternalStore(
    subscribeGuestCarts,
    getGuestCartsSnapshot,
    getGuestCartsServerSnapshot
  )
  const [serverCarts, setServerCarts] = useState<Cart[]>(initialCarts)
  /** Always the newest server-mode carts, for optimistic updates and rollback. */
  const latestServerCarts = useRef<Cart[]>(initialCarts)
  /** Server requests run one at a time, in click order. */
  const requestQueue = useRef<Promise<void>>(Promise.resolve())
  const mergeStarted = useRef(false)

  const commitServerCarts = useCallback((next: Cart[]) => {
    latestServerCarts.current = next
    setServerCarts(next)
  }, [])

  /**
   * Shows `optimistic` immediately, then confirms with the server. A failed
   * request rolls the view back and tells the user.
   */
  const runServerMutation = useCallback(
    (
      optimistic: (carts: Cart[]) => Cart[],
      restaurantId: string,
      request: () => Promise<CartActionResult>
    ) => {
      const rollback = latestServerCarts.current
      commitServerCarts(optimistic(rollback))
      requestQueue.current = requestQueue.current.then(async () => {
        try {
          const result = await request()
          if (result.status === "error") {
            commitServerCarts(rollback)
            notifyError(result.message)
            return
          }
          commitServerCarts(
            replaceCart(latestServerCarts.current, restaurantId, result.cart)
          )
        } catch {
          commitServerCarts(rollback)
          notifyError()
        }
      })
    },
    [commitServerCarts]
  )

  // Carts a guest built before signing in are folded into the account once.
  // They stay in localStorage if the merge fails, so the next visit retries.
  useEffect(() => {
    if (mode !== "server" || mergeStarted.current) return
    const pending = getGuestCartsSnapshot()
    if (pending.length === 0) return

    mergeStarted.current = true
    void (async () => {
      try {
        const result = await mergeGuestCartsAction(toMergePayload(pending))
        if (result.status === "error") {
          notifyError(result.message)
          return
        }
        commitServerCarts(result.carts)
        writeGuestCarts([])
      } catch {
        notifyError()
      }
    })()
  }, [mode, commitServerCarts])

  const removeLine = useCallback(
    (restaurantId: string, menuItemId: string) => {
      const now = new Date()
      if (mode === "guest") {
        updateGuestCarts((carts) =>
          removeItem(carts, restaurantId, menuItemId, now)
        )
      } else if (mode === "server") {
        runServerMutation(
          (carts) => removeItem(carts, restaurantId, menuItemId, now),
          restaurantId,
          () => removeCartItemAction(restaurantId, menuItemId)
        )
      }
    },
    [mode, runServerMutation]
  )

  const setItemQuantity = useCallback(
    (restaurantId: string, menuItemId: string, quantity: number) => {
      if (quantity <= 0) {
        removeLine(restaurantId, menuItemId)
        return
      }
      const now = new Date()
      if (mode === "guest") {
        updateGuestCarts((carts) =>
          setQuantity(carts, restaurantId, menuItemId, quantity, now)
        )
      } else if (mode === "server") {
        runServerMutation(
          (carts) =>
            setQuantity(carts, restaurantId, menuItemId, quantity, now),
          restaurantId,
          () => setCartItemQuantityAction(restaurantId, menuItemId, quantity)
        )
      }
    },
    [mode, removeLine, runServerMutation]
  )

  const add = useCallback(
    (restaurant: RestaurantRef, item: MenuItemRef) => {
      const now = new Date()
      if (mode === "guest") {
        updateGuestCarts((carts) => addItem(carts, restaurant, item, now))
        return
      }
      if (mode !== "server") return

      const current = quantityIn(
        latestServerCarts.current,
        restaurant.id,
        item.id
      )
      if (current >= MAX_ITEM_QUANTITY) return
      // A new line is created; an existing one is set, since the API's add
      // endpoint is for the first line only.
      runServerMutation(
        (carts) => addItem(carts, restaurant, item, now),
        restaurant.id,
        () =>
          current === 0
            ? addToCartAction(restaurant.id, item.id)
            : setCartItemQuantityAction(restaurant.id, item.id, current + 1)
      )
    },
    [mode, runServerMutation]
  )

  const clear = useCallback(
    (restaurantId: string) => {
      if (mode === "guest") {
        updateGuestCarts((carts) => clearCart(carts, restaurantId))
      } else if (mode === "server") {
        runServerMutation(
          (carts) => clearCart(carts, restaurantId),
          restaurantId,
          () => clearCartAction(restaurantId)
        )
      }
    },
    [mode, runServerMutation]
  )

  const forget = useCallback(
    (restaurantId: string) => {
      if (mode === "guest") {
        updateGuestCarts((carts) => clearCart(carts, restaurantId))
      } else if (mode === "server") {
        commitServerCarts(clearCart(latestServerCarts.current, restaurantId))
      }
    },
    [mode, commitServerCarts]
  )

  const syncMenu = useCallback(
    (restaurant: RestaurantRef, menu: MenuItemRef[]) => {
      if (mode !== "guest") return
      updateGuestCarts((carts) => refreshCart(carts, restaurant, menu))
    },
    [mode]
  )

  const carts =
    mode === "server" ? serverCarts : mode === "guest" ? guestCarts : NO_CARTS

  const value = useMemo<CartContextValue>(
    () => ({
      mode,
      carts,
      itemCount: carts.reduce((total, cart) => total + cart.itemCount, 0),
      cartFor: (restaurantId) =>
        carts.find((cart) => cart.restaurantId === restaurantId),
      quantityOf: (restaurantId, menuItemId) =>
        quantityIn(carts, restaurantId, menuItemId),
      add,
      setItemQuantity,
      removeLine,
      clear,
      forget,
      syncMenu,
    }),
    [mode, carts, add, setItemQuantity, removeLine, clear, forget, syncMenu]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const value = useContext(CartContext)
  if (!value) throw new Error("useCart must be used inside <CartProvider>")
  return value
}
