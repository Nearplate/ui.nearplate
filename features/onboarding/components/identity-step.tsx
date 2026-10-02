"use client"

import { useActionState } from "react"

import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import { saveIdentityAction } from "../actions"
import { IDENTITY_DOCUMENTS, stepHref } from "../constants"
import { IDLE_FORM } from "../form-state"
import { documentFileFor } from "../progress"
import type { Kyc, RestaurantDocument } from "../schemas"
import { DocumentUploader } from "./document-uploader"
import { fieldA11y, fieldError } from "./field-a11y"
import { StepActions } from "./step-actions"

interface IdentityStepProps {
  restaurantId: string
  kyc: Kyc
  documents: readonly RestaurantDocument[]
}

const [AADHAAR_FRONT, AADHAAR_BACK, PAN_FRONT, PAN_BACK, FSSAI] =
  IDENTITY_DOCUMENTS

/** Step 2: Aadhaar, PAN and FSSAI -- documents plus the PAN and licence numbers. */
export function IdentityStep({
  restaurantId,
  kyc,
  documents,
}: IdentityStepProps) {
  const [state, formAction] = useActionState(saveIdentityAction, IDLE_FORM)

  function uploader(type: (typeof IDENTITY_DOCUMENTS)[number]) {
    return (
      <DocumentUploader
        restaurantId={restaurantId}
        type={type}
        initial={documentFileFor(documents, type)}
      />
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-8">
      <input type="hidden" name="restaurantId" value={restaurantId} />

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 font-mono text-xs tracking-wider uppercase">
          Aadhaar card
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          {uploader(AADHAAR_FRONT)}
          {uploader(AADHAAR_BACK)}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 font-mono text-xs tracking-wider uppercase">
          PAN card
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          {uploader(PAN_FRONT)}
          {uploader(PAN_BACK)}
        </div>
        <Field
          label="PAN number"
          htmlFor="panNumber"
          hint={
            kyc.panNumber
              ? `Saved as ${kyc.panNumber}. Enter a new number to replace it.`
              : "10 characters, like ABCDE1234F"
          }
          error={fieldError("panNumber", state)}
        >
          <Input
            id="panNumber"
            name="panNumber"
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            maxLength={10}
            required={!kyc.panNumber}
            {...fieldA11y("panNumber", state, true)}
          />
        </Field>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 font-mono text-xs tracking-wider uppercase">
          FSSAI licence
        </legend>
        {uploader(FSSAI)}
        <Field
          label="FSSAI licence number"
          htmlFor="fssaiNumber"
          hint="14 digits"
          error={fieldError("fssaiNumber", state)}
        >
          <Input
            id="fssaiNumber"
            name="fssaiNumber"
            inputMode="numeric"
            autoComplete="off"
            maxLength={14}
            defaultValue={kyc.fssaiNumber ?? ""}
            required
            {...fieldA11y("fssaiNumber", state, true)}
          />
        </Field>
      </fieldset>

      <StepActions state={state} backHref={stepHref("details")} />
    </form>
  )
}
