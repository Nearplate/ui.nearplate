"use client"

import { useActionState } from "react"

import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import type { FormActionState } from "../actions"

const IDLE: FormActionState = { status: "idle" }

interface NameFormProps {
  action: (
    previous: FormActionState,
    formData: FormData
  ) => Promise<FormActionState>
  submitLabel: string
  defaultFirstName?: string
  defaultLastName?: string
  successMessage?: string
}

/** First + last name form shared by onboarding and the account page. */
export function NameForm({
  action,
  submitLabel,
  defaultFirstName = "",
  defaultLastName = "",
  successMessage = "Saved.",
}: NameFormProps) {
  const [state, formAction, isPending] = useActionState(action, IDLE)

  return (
    <form action={formAction} className="flex flex-col gap-3">
      {state.status === "error" ? (
        <Alert tone="error">{state.message}</Alert>
      ) : null}
      {state.status === "success" ? (
        <Alert tone="highlight">{successMessage}</Alert>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="First name" htmlFor="firstName">
          <Input
            id="firstName"
            name="firstName"
            autoComplete="given-name"
            defaultValue={defaultFirstName}
            required
          />
        </Field>
        <Field label="Last name" htmlFor="lastName">
          <Input
            id="lastName"
            name="lastName"
            autoComplete="family-name"
            defaultValue={defaultLastName}
            required
          />
        </Field>
      </div>
      <Button type="submit" loading={isPending}>
        {submitLabel}
      </Button>
    </form>
  )
}
