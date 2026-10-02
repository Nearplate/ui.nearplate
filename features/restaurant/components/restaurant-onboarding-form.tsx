"use client"

import { useActionState, useRef, useState } from "react"

import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import type { FormActionState } from "@/features/auth/actions"

import { createRestaurantAction } from "../actions"
import { DefaultAvatar, DefaultBanner } from "./default-image"
import { LocationFields } from "./location-fields"

const IDLE: FormActionState = { status: "idle" }

interface RestaurantOnboardingFormProps {
  needsName: boolean
}

type Step = "you" | "restaurant" | "location" | "brand"

function stepsFor(needsName: boolean): Step[] {
  return needsName
    ? ["you", "restaurant", "location", "brand"]
    : ["restaurant", "location", "brand"]
}

/**
 * One `<form>` whose steps are shown or hidden, so the final submit posts
 * every field at once to `createRestaurantAction`.
 */
export function RestaurantOnboardingForm({
  needsName,
}: RestaurantOnboardingFormProps) {
  const [state, formAction, isPending] = useActionState(
    createRestaurantAction,
    IDLE
  )
  const steps = stepsFor(needsName)
  const [stepIndex, setStepIndex] = useState(0)
  const step = steps[stepIndex]
  const isLastStep = stepIndex === steps.length - 1
  const [name, setName] = useState("")
  const formRef = useRef<HTMLFormElement>(null)

  function goNext() {
    if (formRef.current?.reportValidity() === false) return
    setStepIndex((i) => i + 1)
  }

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      {state.status === "error" ? (
        <Alert tone="error">{state.message}</Alert>
      ) : null}

      <div className="flex items-center gap-1.5">
        {steps.map((s, i) => (
          <span
            key={s}
            className={
              i <= stepIndex
                ? "h-1 flex-1 bg-highlight"
                : "h-1 flex-1 bg-accented"
            }
          />
        ))}
      </div>

      {needsName ? (
        <fieldset className="flex flex-col gap-3" hidden={step !== "you"}>
          <legend className="font-mono text-xs tracking-wider uppercase">
            Your name
          </legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="First name" htmlFor="firstName">
              <Input
                id="firstName"
                name="firstName"
                required={step === "you"}
              />
            </Field>
            <Field label="Last name" htmlFor="lastName">
              <Input id="lastName" name="lastName" required={step === "you"} />
            </Field>
          </div>
        </fieldset>
      ) : null}

      <fieldset className="flex flex-col gap-3" hidden={step !== "restaurant"}>
        <legend className="font-mono text-xs tracking-wider uppercase">
          About your restaurant
        </legend>
        <Field label="Name" htmlFor="name">
          <Input
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required={step === "restaurant"}
          />
        </Field>
        <Field label="Description (optional)" htmlFor="description">
          <Textarea id="description" name="description" maxLength={500} />
        </Field>
        <Field label="Cuisines (comma-separated)" htmlFor="cuisines">
          <Input
            id="cuisines"
            name="cuisines"
            placeholder="Indian, Chinese, Thai"
            required={step === "restaurant"}
          />
        </Field>
        <label className="flex items-center gap-2 font-mono text-xs tracking-wider uppercase">
          <Switch name="isPureVeg" />
          Pure veg
        </label>
      </fieldset>

      <div hidden={step !== "location"}>
        <p className="mb-3 font-mono text-xs tracking-wider uppercase">
          Where can diners find you?
        </p>
        <LocationFields
          initialLat={null}
          initialLng={null}
          required={step === "location"}
        />
      </div>

      <fieldset className="flex flex-col gap-3" hidden={step !== "brand"}>
        <legend className="font-mono text-xs tracking-wider uppercase">
          Brand
        </legend>
        <p className="text-sm text-toned">
          Upload your logo, banner and dish photos from the Media tab once
          you&apos;re set up. Until then, diners see this.
        </p>
        <div className="border-2 border-inverted">
          <div className="h-20 bg-elevated">
            <DefaultBanner name={name} />
          </div>
          <div className="flex items-center gap-2 p-2">
            <div className="size-10 shrink-0 overflow-hidden border-2 border-inverted text-xl">
              <DefaultAvatar name={name} />
            </div>
            <span className="truncate font-display text-sm uppercase">
              {name || "Your restaurant"}
            </span>
          </div>
        </div>
      </fieldset>

      <div className="flex justify-between gap-2">
        {stepIndex > 0 ? (
          <Button
            type="button"
            variant="outline"
            color="neutral"
            onClick={() => setStepIndex((i) => i - 1)}
          >
            Back
          </Button>
        ) : (
          <span />
        )}
        {isLastStep ? (
          <Button type="submit" loading={isPending}>
            Finish
          </Button>
        ) : (
          <Button type="button" onClick={goNext}>
            Next
          </Button>
        )}
      </div>
    </form>
  )
}
