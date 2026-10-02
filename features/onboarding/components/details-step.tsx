"use client"

import { useActionState } from "react"

import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { LocationFields } from "@/features/restaurant/components/location-fields"
import type { OwnerRestaurant } from "@/features/restaurant/schemas"

import { saveDetailsAction } from "../actions"
import { IDLE_FORM } from "../form-state"
import { StepActions } from "./step-actions"

interface DetailsStepProps {
  restaurant: OwnerRestaurant | null
  /** The owner hasn't set their own name yet. */
  needsName: boolean
}

/** Step 1: owner name (first time only), restaurant profile and location. */
export function DetailsStep({ restaurant, needsName }: DetailsStepProps) {
  const [state, formAction] = useActionState(saveDetailsAction, IDLE_FORM)
  return (
    <form action={formAction} className="flex flex-col gap-6">
      {restaurant ? (
        <input type="hidden" name="restaurantId" value={restaurant.id} />
      ) : null}

      {needsName ? (
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 font-mono text-xs tracking-wider uppercase">
            Your name
          </legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="First name" htmlFor="firstName">
              <Input id="firstName" name="firstName" required />
            </Field>
            <Field label="Last name" htmlFor="lastName">
              <Input id="lastName" name="lastName" required />
            </Field>
          </div>
        </fieldset>
      ) : null}

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 font-mono text-xs tracking-wider uppercase">
          About your restaurant
        </legend>
        <Field label="Name" htmlFor="name">
          <Input
            id="name"
            name="name"
            defaultValue={restaurant?.name}
            required
          />
        </Field>
        <Field label="Description (optional)" htmlFor="description">
          <Textarea
            id="description"
            name="description"
            maxLength={500}
            defaultValue={restaurant?.description ?? ""}
          />
        </Field>
        <Field
          label="Cuisines (comma-separated)"
          htmlFor="cuisines"
          hint="Up to 10, e.g. Indian, Chinese, Thai"
        >
          <Input
            id="cuisines"
            name="cuisines"
            aria-describedby="cuisines-hint"
            defaultValue={restaurant?.cuisines.join(", ")}
            required
          />
        </Field>
        <label className="flex min-h-11 items-center gap-2 font-mono text-xs tracking-wider uppercase">
          <Switch name="isPureVeg" defaultChecked={restaurant?.isPureVeg} />
          Pure veg
        </label>
      </fieldset>

      <section className="flex flex-col gap-3">
        <h2 className="font-mono text-xs tracking-wider uppercase">
          Where can diners find you?
        </h2>
        <LocationFields
          initialLat={restaurant ? restaurant.coordinates[1] : null}
          initialLng={restaurant ? restaurant.coordinates[0] : null}
          initialAddress={restaurant?.address}
          required
        />
      </section>

      <StepActions state={state} />
    </form>
  )
}
