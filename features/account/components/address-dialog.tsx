"use client"

import { useActionState, useEffect } from "react"

import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import type { FormActionState } from "@/features/auth/actions"

import { LocationFields } from "@/features/restaurant/components/location-fields"

import { saveAddressAction } from "../actions"
import type { AccountAddress } from "../schemas"

const IDLE: FormActionState = { status: "idle" }
const COUNTRY_PREFIX = "+91"

/** The phone field shows +91 as a fixed prefix, so drop it from the saved value. */
function initialAddressFrom(address: AccountAddress) {
  const phoneNumber = address.phoneNumber?.startsWith(COUNTRY_PREFIX)
    ? address.phoneNumber.slice(COUNTRY_PREFIX.length)
    : (address.phoneNumber ?? "")
  return { ...address, phoneNumber }
}

interface AddressFormBodyProps {
  address: AccountAddress | null
  onSaved: () => void
}

function AddressFormBody({ address, onSaved }: AddressFormBodyProps) {
  const [state, formAction, isPending] = useActionState(saveAddressAction, IDLE)

  useEffect(() => {
    if (state.status === "success") onSaved()
  }, [state, onSaved])

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="addressId" value={address?.id ?? ""} />
      {state.status === "error" ? (
        <Alert tone="error">{state.message}</Alert>
      ) : null}

      <Field label="Label" htmlFor="address-label">
        <Input
          id="address-label"
          name="label"
          placeholder="Home"
          defaultValue={address?.label ?? ""}
          required
        />
      </Field>

      <LocationFields
        initialLat={address?.lat ?? null}
        initialLng={address?.lng ?? null}
        initialAddress={address ? initialAddressFrom(address) : undefined}
        required
        indianMobile
      />

      <label className="flex items-center gap-2 font-mono text-xs tracking-wider uppercase">
        <Switch name="isDefault" defaultChecked={address?.isDefault ?? false} />
        Set as default
      </label>

      <DialogFooter>
        <Button type="submit" loading={isPending}>
          {address ? "Save changes" : "Add address"}
        </Button>
      </DialogFooter>
    </form>
  )
}

interface AddressDialogProps {
  address: AccountAddress | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Create/edit dialog, remounted per address so its form state always starts fresh. */
export function AddressDialog({
  address,
  open,
  onOpenChange,
}: AddressDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={address ? "Edit address" : "Add address"}>
        <AddressFormBody
          key={address?.id ?? "new"}
          address={address}
          onSaved={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
