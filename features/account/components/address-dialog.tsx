"use client"

import { useActionState, useEffect } from "react"

import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import type { FormActionState } from "@/features/auth/actions"

import { saveAddressAction } from "../actions"
import type { AccountAddress } from "../schemas"

const IDLE: FormActionState = { status: "idle" }

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

      <Field label="Address line 1" htmlFor="address-line1">
        <Input
          id="address-line1"
          name="line1"
          defaultValue={address?.line1}
          required
        />
      </Field>

      <Field label="Address line 2 (optional)" htmlFor="address-line2">
        <Input
          id="address-line2"
          name="line2"
          defaultValue={address?.line2 ?? ""}
        />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="City" htmlFor="address-city">
          <Input
            id="address-city"
            name="city"
            defaultValue={address?.city}
            required
          />
        </Field>
        <Field label="State" htmlFor="address-state">
          <Input
            id="address-state"
            name="state"
            defaultValue={address?.state}
            required
          />
        </Field>
        <Field label="Zipcode" htmlFor="address-zipcode">
          <Input
            id="address-zipcode"
            name="zipcode"
            defaultValue={address?.zipcode}
            required
          />
        </Field>
        <Field label="Phone (optional)" htmlFor="address-phoneNumber">
          <Input
            id="address-phoneNumber"
            name="phoneNumber"
            inputMode="tel"
            defaultValue={address?.phoneNumber ?? ""}
          />
        </Field>
      </div>

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
