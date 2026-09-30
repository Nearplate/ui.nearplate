/** Mirrors the API's `MAX_CARTS_PER_USER` (one cart per restaurant). */
export const MAX_CARTS = 5

/** Mirrors the API's `MAX_ITEM_QUANTITY`; a line never exceeds what an order allows. */
export const MAX_ITEM_QUANTITY = 20

/** localStorage key holding a guest's carts. */
export const GUEST_CART_STORAGE_KEY = "np_cart"
