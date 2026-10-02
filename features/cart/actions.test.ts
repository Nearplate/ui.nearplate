import { revalidatePath } from "next/cache"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { listAddresses } from "@/features/account/api/address-api"
import { getAccessToken } from "@/features/auth/session"
import { ApiError } from "@/lib/api/client"

import {
  addToCartAction,
  checkoutAction,
  clearCartAction,
  loginToCheckoutAction,
  mergeGuestCartsAction,
  removeCartItemAction,
  setCartItemQuantityAction,
} from "./actions"
import {
  addCartItem,
  checkoutCart,
  deleteCart,
  mergeCarts,
  removeCartItem,
  updateCartItem,
} from "./api/cart-api"
import type { Cart } from "./schemas"

const cookieSet = vi.fn()

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`)
  }),
}))
vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({ set: cookieSet })),
}))
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }))
vi.mock("@/features/auth/session", () => ({ getAccessToken: vi.fn() }))
vi.mock("@/features/account/api/address-api")
vi.mock("./api/cart-api")

const RESTAURANT_ID = "7b1c2f0e-8a4d-4c55-9f0a-1234567890ab"
const ITEM_ID = "0d9f7a52-3b8e-4a61-8c1d-abcdef123456"
const ADDRESS_ID = "5e2a91c4-6f3b-4d7e-b0a8-fedcba654321"

const CART: Cart = {
  restaurantId: RESTAURANT_ID,
  restaurant: { name: "Eat N Crave", slug: "eat-n-crave", status: "online" },
  items: [
    {
      menuItemId: ITEM_ID,
      name: "Paneer Tikka",
      imageUrl: null,
      priceInPaise: 24900,
      quantity: 1,
      lineTotalInPaise: 24900,
      isAvailable: true,
    },
  ],
  itemCount: 1,
  subtotalInPaise: 24900,
  totalInPaise: 24900,
  canCheckout: true,
  updatedAt: "2026-09-30T10:00:00.000Z",
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getAccessToken).mockResolvedValue("at")
})

describe("addToCartAction", () => {
  it("adds one and returns the priced cart", async () => {
    vi.mocked(addCartItem).mockResolvedValue(CART)

    const result = await addToCartAction(RESTAURANT_ID, ITEM_ID)

    expect(addCartItem).toHaveBeenCalledWith("at", RESTAURANT_ID, ITEM_ID, 1)
    expect(result).toEqual({ status: "ok", cart: CART })
  })

  it("asks the visitor to sign in when there is no session", async () => {
    vi.mocked(getAccessToken).mockResolvedValue(null)

    const result = await addToCartAction(RESTAURANT_ID, ITEM_ID)

    expect(result).toEqual({
      status: "error",
      message: "Sign in to use your cart.",
    })
    expect(addCartItem).not.toHaveBeenCalled()
  })

  it("rejects malformed ids without calling the API", async () => {
    const result = await addToCartAction("not-a-uuid", ITEM_ID)

    expect(result.status).toBe("error")
    expect(addCartItem).not.toHaveBeenCalled()
  })

  it("explains a 409 as unavailable", async () => {
    vi.mocked(addCartItem).mockRejectedValue(new ApiError(409))

    const result = await addToCartAction(RESTAURANT_ID, ITEM_ID)

    expect(result).toEqual({
      status: "error",
      message: "This restaurant or item isn't available right now.",
    })
  })

  it("rethrows unexpected errors", async () => {
    vi.mocked(addCartItem).mockRejectedValue(new Error("boom"))

    await expect(addToCartAction(RESTAURANT_ID, ITEM_ID)).rejects.toThrow(
      "boom"
    )
  })
})

describe("setCartItemQuantityAction", () => {
  it("sets the quantity outright", async () => {
    vi.mocked(updateCartItem).mockResolvedValue(CART)

    const result = await setCartItemQuantityAction(RESTAURANT_ID, ITEM_ID, 3)

    expect(updateCartItem).toHaveBeenCalledWith("at", RESTAURANT_ID, ITEM_ID, 3)
    expect(result).toEqual({ status: "ok", cart: CART })
  })

  it.each([0, 21, 1.5])("rejects quantity %s", async (quantity) => {
    const result = await setCartItemQuantityAction(
      RESTAURANT_ID,
      ITEM_ID,
      quantity
    )

    expect(result.status).toBe("error")
    expect(updateCartItem).not.toHaveBeenCalled()
  })
})

describe("removeCartItemAction / clearCartAction", () => {
  it("reports the cart as gone once its last line is removed", async () => {
    vi.mocked(removeCartItem).mockResolvedValue({ ...CART, items: [] })

    const result = await removeCartItemAction(RESTAURANT_ID, ITEM_ID)

    expect(result).toEqual({ status: "ok", cart: null })
  })

  it("clears a cart", async () => {
    vi.mocked(deleteCart).mockResolvedValue(undefined)

    const result = await clearCartAction(RESTAURANT_ID)

    expect(deleteCart).toHaveBeenCalledWith("at", RESTAURANT_ID)
    expect(result).toEqual({ status: "ok", cart: null })
  })
})

describe("mergeGuestCartsAction", () => {
  const PAYLOAD = {
    carts: [
      {
        restaurantId: RESTAURANT_ID,
        items: [{ menuItemId: ITEM_ID, quantity: 2 }],
      },
    ],
  }

  it("forwards the guest carts and returns the merged server carts", async () => {
    vi.mocked(mergeCarts).mockResolvedValue([CART])

    const result = await mergeGuestCartsAction(PAYLOAD)

    expect(mergeCarts).toHaveBeenCalledWith("at", PAYLOAD)
    expect(result).toEqual({ status: "ok", carts: [CART] })
  })

  it("rejects a malformed payload without calling the API", async () => {
    const result = await mergeGuestCartsAction({
      carts: [{ restaurantId: "nope", items: [] }],
    })

    expect(result.status).toBe("error")
    expect(mergeCarts).not.toHaveBeenCalled()
  })
})

describe("checkoutAction", () => {
  const SAVED_ADDRESS = {
    id: ADDRESS_ID,
    label: "Home",
    isDefault: true,
    line1: "221B Baker Street",
    line2: null,
    city: "Mumbai",
    state: "MH",
    zipcode: "400001",
    phoneNumber: "+919876543210",
    lat: 19.07,
    lng: 72.87,
    createdAt: "2026-09-01T00:00:00.000Z",
    updatedAt: "2026-09-01T00:00:00.000Z",
  }

  it("places the order with the saved address, never client-sent fields", async () => {
    vi.mocked(listAddresses).mockResolvedValue([SAVED_ADDRESS])
    vi.mocked(checkoutCart).mockResolvedValue({
      id: "order-1",
    } as Awaited<ReturnType<typeof checkoutCart>>)

    const result = await checkoutAction(RESTAURANT_ID, ADDRESS_ID)

    expect(checkoutCart).toHaveBeenCalledWith("at", RESTAURANT_ID, {
      line1: "221B Baker Street",
      line2: null,
      city: "Mumbai",
      state: "MH",
      zipcode: "400001",
      phoneNumber: "+919876543210",
      label: "Home",
    })
    expect(revalidatePath).toHaveBeenCalledWith("/account")
    expect(result).toEqual({ status: "ok", orderId: "order-1" })
  })

  it("asks for an address when the chosen one is not the caller's", async () => {
    vi.mocked(listAddresses).mockResolvedValue([])

    const result = await checkoutAction(RESTAURANT_ID, ADDRESS_ID)

    expect(result).toEqual({
      status: "error",
      message: "Choose a delivery address.",
    })
    expect(checkoutCart).not.toHaveBeenCalled()
  })

  it("keeps the cart and explains a 409", async () => {
    vi.mocked(listAddresses).mockResolvedValue([SAVED_ADDRESS])
    vi.mocked(checkoutCart).mockRejectedValue(new ApiError(409))

    const result = await checkoutAction(RESTAURANT_ID, ADDRESS_ID)

    expect(result.status).toBe("error")
    expect(revalidatePath).not.toHaveBeenCalled()
  })
})

describe("loginToCheckoutAction", () => {
  it("remembers the cart page and sends the guest to sign in", async () => {
    await expect(loginToCheckoutAction()).rejects.toThrow("REDIRECT:/auth")

    expect(cookieSet).toHaveBeenCalledWith(
      "np_return_to",
      "/cart",
      expect.objectContaining({ httpOnly: true })
    )
  })
})
