"use client"

import { PlusIcon } from "lucide-react"
import { useActionState, useEffect, useState } from "react"

import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Combobox,
  ComboboxContent,
  ComboboxItem,
  ComboboxTrigger,
  ComboboxValue,
  Select,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import type { FormActionState } from "@/features/auth/actions"

import { saveMenuItemAction } from "../actions"
import {
  DEFAULT_CATEGORIES,
  FOOD_TYPE_LABELS,
  FOOD_TYPES,
  type MenuItem,
} from "../schemas"

const IDLE: FormActionState = { status: "idle" }

interface MenuItemFormProps {
  restaurantId: string
  item: MenuItem | null
  categories: string[]
  onSaved: () => void
}

function MenuItemFormBody({
  restaurantId,
  item,
  categories,
  onSaved,
}: MenuItemFormProps) {
  const [state, formAction, isPending] = useActionState(
    saveMenuItemAction,
    IDLE
  )
  const categoryOptions = Array.from(
    new Set([
      ...DEFAULT_CATEGORIES,
      ...categories,
      ...(item ? [item.category] : []),
    ])
  )
  const [selectedCategory, setSelectedCategory] = useState(
    item ? item.category : ""
  )
  const [isNewCategory, setIsNewCategory] = useState(false)

  useEffect(() => {
    if (state.status === "success") onSaved()
  }, [state, onSaved])

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="restaurantId" value={restaurantId} />
      <input type="hidden" name="itemId" value={item?.id ?? ""} />
      {state.status === "error" ? (
        <Alert tone="error">{state.message}</Alert>
      ) : null}

      <Field label="Name" htmlFor="item-name">
        <Input id="item-name" name="name" defaultValue={item?.name} required />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Category" htmlFor="item-category">
          {isNewCategory ? (
            <div className="flex flex-col gap-1">
              <Input id="item-category" name="category" autoFocus required />
              <button
                type="button"
                onClick={() => setIsNewCategory(false)}
                className="self-start font-mono text-[10px] text-muted uppercase underline"
              >
                Choose from list
              </button>
            </div>
          ) : (
            <div className="flex gap-1.5">
              <Combobox
                name="category"
                required
                value={selectedCategory}
                onValueChange={(value) => setSelectedCategory(value as string)}
              >
                <ComboboxTrigger id="item-category" className="flex-1">
                  <ComboboxValue placeholder="Select a category" />
                </ComboboxTrigger>
                <ComboboxContent>
                  {categoryOptions.map((category) => (
                    <ComboboxItem key={category} value={category}>
                      {category}
                    </ComboboxItem>
                  ))}
                </ComboboxContent>
              </Combobox>
              <Button
                type="button"
                variant="outline"
                color="neutral"
                size="md"
                square
                aria-label="New category"
                onClick={() => setIsNewCategory(true)}
              >
                <PlusIcon aria-hidden />
              </Button>
            </div>
          )}
        </Field>
        <Field label="Price (₹)" htmlFor="item-price">
          <Input
            id="item-price"
            name="price"
            inputMode="decimal"
            defaultValue={
              item ? (item.priceInPaise / 100).toFixed(2) : undefined
            }
            required
          />
        </Field>
      </div>

      <Field label="Food type" htmlFor="item-foodType">
        <Select
          id="item-foodType"
          name="foodType"
          defaultValue={item?.foodType ?? "veg"}
        >
          {FOOD_TYPES.map((type) => (
            <option key={type} value={type}>
              {FOOD_TYPE_LABELS[type]}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Description" htmlFor="item-description">
        <Textarea
          id="item-description"
          name="description"
          defaultValue={item?.description ?? ""}
        />
      </Field>

      <Field label="Image URL" htmlFor="item-imageUrl">
        <Input
          id="item-imageUrl"
          name="imageUrl"
          type="url"
          placeholder="https://..."
          defaultValue={item?.imageUrl ?? ""}
        />
      </Field>

      <label className="flex items-center gap-2 font-mono text-xs tracking-wider uppercase">
        <Switch name="isAvailable" defaultChecked={item?.isAvailable ?? true} />
        Available
      </label>

      <DialogFooter>
        <Button type="submit" loading={isPending}>
          {item ? "Save changes" : "Add item"}
        </Button>
      </DialogFooter>
    </form>
  )
}

interface MenuItemDialogProps {
  restaurantId: string
  item: MenuItem | null
  categories: string[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Create/edit dialog, remounted per item so its form state always starts fresh. */
export function MenuItemDialog({
  restaurantId,
  item,
  categories,
  open,
  onOpenChange,
}: MenuItemDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={item ? "Edit dish" : "Add dish"}>
        <MenuItemFormBody
          key={item?.id ?? "new"}
          restaurantId={restaurantId}
          item={item}
          categories={categories}
          onSaved={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
