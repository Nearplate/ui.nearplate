"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import { Alert } from "@/components/ui/alert"
import { Button, buttonTheme } from "@/components/ui/button"
import { Card, CardBody, CardHeader } from "@/components/ui/card"
import { AddressDialog } from "@/features/account/components/address-dialog"
import type { AccountAddress } from "@/features/account/schemas"
import { formatPaise } from "@/features/restaurant/money"

import { checkoutAction } from "../actions"
import { useCart } from "../cart-context"
import type { Cart } from "../schemas"
import { CartLines } from "./cart-lines"

interface CheckoutFormProps {
  cart: Cart
  addresses: AccountAddress[]
}

function addressLines(address: AccountAddress): string {
  return [address.line1, address.line2, address.city, address.state]
    .filter(Boolean)
    .join(", ")
}

/** Order summary plus a saved-address picker; placing the order consumes the cart. */
export function CheckoutForm({ cart, addresses }: CheckoutFormProps) {
  const router = useRouter()
  const { forget } = useCart()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [addressDialogOpen, setAddressDialogOpen] = useState(false)
  const [chosenId, setChosenId] = useState<string | null>(null)

  // A newly saved address arrives through a refresh; until the user picks one,
  // the default (or first) address is selected.
  const fallback = addresses.find((entry) => entry.isDefault) ?? addresses[0]
  const selectedId = addresses.some((entry) => entry.id === chosenId)
    ? chosenId
    : (fallback?.id ?? null)

  function handleDialogChange(open: boolean) {
    setAddressDialogOpen(open)
    if (!open) router.refresh()
  }

  function placeOrder() {
    if (!selectedId) return
    setError(null)
    startTransition(async () => {
      const result = await checkoutAction(cart.restaurantId, selectedId)
      if (result.status === "error") {
        setError(result.message)
        return
      }
      forget(cart.restaurantId)
      router.push(`/account/orders/${result.orderId}`)
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <Card>
        <CardHeader className="border-b-2 border-default font-display text-2xl uppercase">
          {cart.restaurant.name}
        </CardHeader>
        <CardBody className="flex flex-col gap-3">
          <CartLines cart={cart} editable={false} />
          <div className="flex items-center justify-between border-t-2 border-dashed border-default pt-3 font-mono text-sm">
            <span className="tracking-wider uppercase">Total</span>
            <span>{formatPaise(cart.totalInPaise)}</span>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between gap-2 border-b-2 border-default">
          <h2 className="font-mono text-sm tracking-wider uppercase">
            Deliver to
          </h2>
          <Button
            type="button"
            variant="outline"
            color="neutral"
            size="sm"
            onClick={() => setAddressDialogOpen(true)}
          >
            Add address
          </Button>
        </CardHeader>
        <CardBody>
          {addresses.length === 0 ? (
            <p className="text-sm text-muted">
              Add a delivery address to place your order.
            </p>
          ) : (
            <fieldset className="flex flex-col gap-2">
              <legend className="sr-only">Delivery address</legend>
              {addresses.map((address) => (
                <label
                  key={address.id}
                  className="flex cursor-pointer items-start gap-3 border-2 border-accented p-3 has-checked:border-inverted"
                >
                  <input
                    type="radio"
                    name="address"
                    value={address.id}
                    checked={address.id === selectedId}
                    onChange={() => setChosenId(address.id)}
                    className="mt-1"
                  />
                  <span className="flex flex-col gap-0.5 text-sm">
                    <span className="font-medium">
                      {address.label ?? "Address"}
                    </span>
                    <span className="text-muted">{addressLines(address)}</span>
                    <span className="font-mono text-xs text-muted">
                      {address.zipcode}
                      {address.phoneNumber ? ` · ${address.phoneNumber}` : ""}
                    </span>
                  </span>
                </label>
              ))}
            </fieldset>
          )}
        </CardBody>
      </Card>

      {cart.canCheckout ? null : (
        <Alert tone="error">
          This cart can&apos;t be ordered right now. The restaurant may be
          closed or an item unavailable.{" "}
          <Link href="/cart" className="underline">
            Back to cart
          </Link>
        </Alert>
      )}
      {error ? <Alert tone="error">{error}</Alert> : null}
      <Alert>Online payment isn&apos;t available yet.</Alert>

      <div className="flex justify-end gap-2">
        <Link
          href="/cart"
          className={buttonTheme({ variant: "outline", color: "neutral" })}
        >
          Back to cart
        </Link>
        <Button
          type="button"
          onClick={placeOrder}
          loading={isPending}
          disabled={!cart.canCheckout || !selectedId}
        >
          Place order
        </Button>
      </div>

      <AddressDialog
        address={null}
        open={addressDialogOpen}
        onOpenChange={handleDialogChange}
      />
    </div>
  )
}
