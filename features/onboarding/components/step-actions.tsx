"use client"

import Link from "next/link"
import { useFormStatus } from "react-dom"

import { Alert } from "@/components/ui/alert"
import { Button, buttonTheme } from "@/components/ui/button"

import type { OnboardingFormState } from "../form-state"

interface StepActionsProps {
  state: OnboardingFormState
  /** Where Back goes; omitted on the first step. */
  backHref?: string
  nextLabel?: string
  nextDisabled?: boolean
}

/**
 * Form-level error plus Back/Next. Sticky to the bottom on mobile so the
 * primary action stays in thumb reach; inline from `md` up.
 */
export function StepActions({
  state,
  backHref,
  nextLabel = "Next",
  nextDisabled = false,
}: StepActionsProps) {
  const { pending } = useFormStatus()
  return (
    <div className="sticky bottom-0 -mx-4 flex flex-col gap-3 border-t-2 border-inverted bg-default p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:-mx-6 sm:px-6 md:static md:mx-0 md:border-t-0 md:p-0 md:pb-12">
      {state.status === "error" ? (
        <Alert tone="error">{state.message}</Alert>
      ) : null}
      <div className="flex gap-2 md:justify-end">
        {backHref ? (
          <Link
            href={backHref}
            className={buttonTheme({
              variant: "outline",
              color: "neutral",
              size: "lg",
              className: "flex-1 md:flex-none",
            })}
          >
            Back
          </Link>
        ) : null}
        <Button
          type="submit"
          size="lg"
          loading={pending}
          disabled={nextDisabled}
          className="flex-1 md:flex-none"
        >
          {nextLabel}
        </Button>
      </div>
    </div>
  )
}
