"use client"

import { useActionState } from "react"

import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import { saveBankAction } from "../actions"
import { stepHref } from "../constants"
import { IDLE_FORM } from "../form-state"
import { documentFileFor } from "../progress"
import type { Kyc, RestaurantDocument } from "../schemas"
import { DocumentUploader } from "./document-uploader"
import { fieldA11y, fieldError } from "./field-a11y"
import { StepActions } from "./step-actions"

interface BankStepProps {
  restaurantId: string
  kyc: Kyc
  documents: readonly RestaurantDocument[]
}

/** Step 3: payout bank account and a proof document (cheque or statement). */
export function BankStep({ restaurantId, kyc, documents }: BankStepProps) {
  const [state, formAction] = useActionState(saveBankAction, IDLE_FORM)
  return (
    <form action={formAction} className="flex flex-col gap-8">
      <input type="hidden" name="restaurantId" value={restaurantId} />

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 font-mono text-xs tracking-wider uppercase">
          Bank account
        </legend>
        <Field
          label="Account holder name"
          htmlFor="accountHolderName"
          error={fieldError("accountHolderName", state)}
        >
          <Input
            id="accountHolderName"
            name="accountHolderName"
            autoComplete="off"
            defaultValue={kyc.accountHolderName ?? ""}
            required
            {...fieldA11y("accountHolderName", state)}
          />
        </Field>
        <Field
          label="Account number"
          htmlFor="accountNumber"
          hint={
            kyc.accountNumber
              ? `Saved as ${kyc.accountNumber}. Enter a new number to replace it.`
              : "9 to 18 digits"
          }
          error={fieldError("accountNumber", state)}
        >
          <Input
            id="accountNumber"
            name="accountNumber"
            inputMode="numeric"
            autoComplete="off"
            maxLength={18}
            required={!kyc.accountNumber}
            {...fieldA11y("accountNumber", state, true)}
          />
        </Field>
        <Field
          label="Re-enter account number"
          htmlFor="confirmAccountNumber"
          error={fieldError("confirmAccountNumber", state)}
        >
          <Input
            id="confirmAccountNumber"
            name="confirmAccountNumber"
            inputMode="numeric"
            autoComplete="off"
            maxLength={18}
            required={!kyc.accountNumber}
            {...fieldA11y("confirmAccountNumber", state)}
          />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="IFSC code"
            htmlFor="ifscCode"
            hint="11 characters, like HDFC0001234"
            error={fieldError("ifscCode", state)}
          >
            <Input
              id="ifscCode"
              name="ifscCode"
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              maxLength={11}
              defaultValue={kyc.ifscCode ?? ""}
              required
              {...fieldA11y("ifscCode", state, true)}
            />
          </Field>
          <Field
            label="Bank name"
            htmlFor="bankName"
            error={fieldError("bankName", state)}
          >
            <Input
              id="bankName"
              name="bankName"
              autoComplete="off"
              defaultValue={kyc.bankName ?? ""}
              required
              {...fieldA11y("bankName", state)}
            />
          </Field>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 font-mono text-xs tracking-wider uppercase">
          Proof
        </legend>
        <p className="text-sm text-toned">
          A cancelled cheque or a recent bank statement showing the account
          holder and number.
        </p>
        <DocumentUploader
          restaurantId={restaurantId}
          type="bank_proof"
          initial={documentFileFor(documents, "bank_proof")}
        />
      </fieldset>

      <StepActions state={state} backHref={stepHref("identity")} />
    </form>
  )
}
