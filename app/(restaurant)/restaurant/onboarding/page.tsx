import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { getAccessToken } from "@/features/auth/session"
import { BankStep } from "@/features/onboarding/components/bank-step"
import { DetailsStep } from "@/features/onboarding/components/details-step"
import { IdentityStep } from "@/features/onboarding/components/identity-step"
import { OnboardingShell } from "@/features/onboarding/components/onboarding-shell"
import { ReviewStep } from "@/features/onboarding/components/review-step"
import { WizardStepper } from "@/features/onboarding/components/wizard-stepper"
import { getKyc, listDocuments } from "@/features/onboarding/api/onboarding-api"
import { STEP_LABELS, ONBOARDING_STEPS } from "@/features/onboarding/constants"
import { clampStep, onboardingProgress } from "@/features/onboarding/progress"
import { onboardingRedirect } from "@/features/onboarding/routing"
import { EMPTY_KYC, stepSchema } from "@/features/onboarding/schemas"
import {
  getMyRestaurant,
  requireRestaurantOwner,
} from "@/features/restaurant/session"
import { Alert } from "@/components/ui/alert"

export const metadata: Metadata = { title: "Set up your restaurant" }

interface OnboardingPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function RestaurantOnboardingPage({
  searchParams,
}: OnboardingPageProps) {
  const user = await requireRestaurantOwner()
  const restaurant = await getMyRestaurant()
  const redirectTo = onboardingRedirect(
    restaurant?.verificationStatus ?? null,
    "wizard"
  )
  if (redirectTo) redirect(redirectTo)

  const accessToken = await getAccessToken()
  if (!accessToken) redirect("/auth")
  const [kyc, documents] = restaurant
    ? await Promise.all([
        getKyc(accessToken, restaurant.id),
        listDocuments(accessToken, restaurant.id),
      ])
    : [EMPTY_KYC, []]

  const progress = onboardingProgress({ restaurant, kyc, documents })
  const requested = stepSchema.safeParse((await searchParams).step)
  const step = clampStep(
    requested.success ? requested.data : undefined,
    progress.firstIncomplete
  )
  const completed = ONBOARDING_STEPS.filter((s) => progress.completed[s])

  return (
    <OnboardingShell
      aside={
        <WizardStepper variant="aside" current={step} completed={completed} />
      }
    >
      <WizardStepper variant="inline" current={step} completed={completed} />
      <h1 className="font-display text-3xl uppercase">{STEP_LABELS[step]}</h1>

      {restaurant?.verificationStatus === "rejected" ? (
        <Alert tone="error">
          Your submission was rejected
          {restaurant.rejectionReason
            ? `: ${restaurant.rejectionReason}`
            : "."}{" "}
          Fix the details below and submit again.
        </Alert>
      ) : null}

      {step === "details" ? (
        <DetailsStep restaurant={restaurant} needsName={!user.isOnboarded} />
      ) : null}
      {restaurant && step === "identity" ? (
        <IdentityStep
          restaurantId={restaurant.id}
          kyc={kyc}
          documents={documents}
        />
      ) : null}
      {restaurant && step === "bank" ? (
        <BankStep
          restaurantId={restaurant.id}
          kyc={kyc}
          documents={documents}
        />
      ) : null}
      {restaurant && step === "review" ? (
        <ReviewStep
          restaurant={restaurant}
          kyc={kyc}
          documents={documents}
          missing={progress.missing}
        />
      ) : null}
    </OnboardingShell>
  )
}
