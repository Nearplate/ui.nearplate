"use client"

import { useActionState } from "react"

import { Alert } from "@/components/ui/alert"
import type { OwnerRestaurant } from "@/features/restaurant/schemas"

import { submitForReviewAction } from "../actions"
import { stepHref } from "../constants"
import { IDLE_FORM } from "../form-state"
import type { Kyc, RestaurantDocument } from "../schemas"
import { OnboardingSummary } from "./onboarding-summary"
import { StepActions } from "./step-actions"

interface ReviewStepProps {
  restaurant: OwnerRestaurant
  kyc: Kyc
  documents: readonly RestaurantDocument[]
  /** Labels of everything still needed; Submit stays disabled until empty. */
  missing: readonly string[]
}

/** Step 4: recap with Edit links, then Submit for review. */
export function ReviewStep({
  restaurant,
  kyc,
  documents,
  missing,
}: ReviewStepProps) {
  const [state, formAction] = useActionState(submitForReviewAction, IDLE_FORM)
  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="restaurantId" value={restaurant.id} />
      {missing.length > 0 ? (
        <Alert tone="error">
          Still needed before you can submit: {missing.join(", ")}.
        </Alert>
      ) : (
        <p className="text-sm text-toned">
          Check everything below. Once submitted, your documents and bank
          details are locked while we review them.
        </p>
      )}
      <OnboardingSummary
        restaurant={restaurant}
        kyc={kyc}
        documents={documents}
        editable
      />
      <StepActions
        state={state}
        backHref={stepHref("bank")}
        nextLabel="Submit for review"
        nextDisabled={missing.length > 0}
      />
    </form>
  )
}
