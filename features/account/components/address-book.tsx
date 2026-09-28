"use client"

import { EllipsisVerticalIcon, PlusIcon } from "lucide-react"
import { useState, useTransition } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog"
import { Menu, MenuContent, MenuItem, MenuTrigger } from "@/components/ui/menu"

import { deleteAddressAction, setDefaultAddressAction } from "../actions"
import type { AccountAddress } from "../schemas"
import { AddressDialog } from "./address-dialog"

interface AddressBookProps {
  addresses: AccountAddress[]
}

/** Add, edit, delete and set-default for the caller's saved addresses. */
export function AddressBook({ addresses }: AddressBookProps) {
  const [editing, setEditing] = useState<AccountAddress | null | undefined>(
    undefined
  )
  const [deleting, setDeleting] = useState<AccountAddress | null>(null)
  const [isPending, startTransition] = useTransition()

  function confirmDelete() {
    if (!deleting) return
    const address = deleting
    startTransition(async () => {
      await deleteAddressAction(address.id)
      setDeleting(null)
    })
  }

  function makeDefault(address: AccountAddress) {
    startTransition(async () => {
      await setDefaultAddressAction(address.id)
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <Button
        type="button"
        size="sm"
        onClick={() => setEditing(null)}
        className="self-start"
      >
        <PlusIcon aria-hidden className="size-3.5" />
        Add address
      </Button>

      {addresses.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">
          No addresses saved yet.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="flex flex-col gap-1.5 border-2 border-accented p-3"
            >
              <div className="flex items-center gap-1.5">
                <Badge color="neutral" variant="soft">
                  {address.label ?? "Address"}
                </Badge>
                {address.isDefault ? (
                  <Badge color="primary" variant="solid">
                    Default
                  </Badge>
                ) : null}
                <Menu>
                  <MenuTrigger
                    aria-label="Address actions"
                    className="ml-auto cursor-pointer p-1 hover:bg-elevated"
                  >
                    <EllipsisVerticalIcon aria-hidden className="size-4" />
                  </MenuTrigger>
                  <MenuContent>
                    <MenuItem onClick={() => setEditing(address)}>
                      Edit
                    </MenuItem>
                    {!address.isDefault ? (
                      <MenuItem onClick={() => makeDefault(address)}>
                        Set default
                      </MenuItem>
                    ) : null}
                    <MenuItem onClick={() => setDeleting(address)}>
                      Delete
                    </MenuItem>
                  </MenuContent>
                </Menu>
              </div>
              <p className="text-sm">
                {address.line1}
                {address.line2 ? `, ${address.line2}` : ""}, {address.city},{" "}
                {address.state} {address.zipcode}
              </p>
              {address.phoneNumber ? (
                <p className="font-mono text-xs text-muted">
                  {address.phoneNumber}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      )}

      <AddressDialog
        address={editing ?? null}
        open={editing !== undefined}
        onOpenChange={(open) => {
          if (!open) setEditing(undefined)
        }}
      />

      <Dialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null)
        }}
      >
        <DialogContent
          title="Delete address?"
          description={
            deleting
              ? `"${deleting.label ?? "This address"}" will be removed for good.`
              : undefined
          }
        >
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              color="neutral"
              onClick={() => setDeleting(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              color="error"
              loading={isPending}
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
