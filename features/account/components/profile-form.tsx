"use client"

import { useActionState } from "react"

import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import type { FormActionState } from "@/features/auth/actions"
import { GENDER_LABELS, USER_GENDERS, type User } from "@/features/auth/schemas"

import { updateAccountProfileAction } from "../actions"

const IDLE: FormActionState = { status: "idle" }

interface ProfileFormProps {
  user: User
}

/** Optional profile fields: mobile, date of birth, anniversary and gender. */
export function ProfileForm({ user }: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateAccountProfileAction,
    IDLE
  )

  return (
    <form action={formAction} className="flex flex-col gap-3">
      {state.status === "error" ? (
        <Alert tone="error">{state.message}</Alert>
      ) : null}
      {state.status === "success" ? (
        <Alert tone="highlight">Profile updated.</Alert>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="First name" htmlFor="firstName">
          <Input
            id="firstName"
            name="firstName"
            defaultValue={user.firstName ?? ""}
          />
        </Field>
        <Field label="Last name" htmlFor="lastName">
          <Input
            id="lastName"
            name="lastName"
            defaultValue={user.lastName ?? ""}
          />
        </Field>
        <Field label="Mobile" htmlFor="phoneNumber">
          <Input
            id="phoneNumber"
            name="phoneNumber"
            inputMode="tel"
            defaultValue={user.phoneNumber ?? ""}
          />
        </Field>
        <Field label="Email" htmlFor="email">
          <Input id="email" defaultValue={user.email} disabled readOnly />
        </Field>
        <Field label="Date of birth" htmlFor="dateOfBirth">
          <Input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            defaultValue={user.dateOfBirth ?? ""}
          />
        </Field>
        <Field label="Anniversary" htmlFor="anniversaryDate">
          <Input
            id="anniversaryDate"
            name="anniversaryDate"
            type="date"
            defaultValue={user.anniversaryDate ?? ""}
          />
        </Field>
        <Field label="Gender" htmlFor="gender">
          <Select id="gender" name="gender" defaultValue={user.gender ?? ""}>
            <option value="">Not set</option>
            {USER_GENDERS.map((gender) => (
              <option key={gender} value={gender}>
                {GENDER_LABELS[gender]}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Button type="submit" loading={isPending} className="self-start">
        Save changes
      </Button>
    </form>
  )
}
