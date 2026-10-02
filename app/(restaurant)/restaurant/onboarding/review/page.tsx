import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { buttonTheme } from "@/components/ui/button"
import { getAccessToken } from "@/features/auth/session"
import { getKyc, listDocuments } from "@/features/onboarding/api/onboarding-api"
import { OnboardingShell } from "@/features/onboarding/components/onboarding-shell"
import { OnboardingSummary } from "@/features/onboarding/components/onboarding-summary"
import { stepHref } from "@/features/onboarding/constants"
import { onboardingRedirect } from "@/features/onboarding/routing"
import {
  getMyRestaurant,
  requireRestaurantOwner,
} from "@/features/restaurant/session"

export const metadata: Metadata = { title: "Application status" }

export default async function OnboardingReviewPage() {
  await requireRestaurantOwner()
  const restaurant = await getMyRestaurant()
  const redirectTo = onboardingRedirect(
    restaurant?.verificationStatus ?? null,
    "review"
  )
  if (redirectTo || !restaurant)
    redirect(redirectTo ?? "/restaurant/onboarding")

  const accessToken = await getAccessToken()
  if (!accessToken) redirect("/auth")
  const [kyc, documents] = await Promise.all([
    getKyc(accessToken, restaurant.id),
    listDocuments(accessToken, restaurant.id),
  ])
  const isRejected = restaurant.verificationStatus === "rejected"

  return (
    <OnboardingShell aside={null}>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl uppercase">
            Application status
          </h1>
          <Badge color={isRejected ? "error" : "neutral"} variant="solid">
            {isRejected ? "Rejected" : "Under review"}
          </Badge>
        </div>
        {isRejected ? (
          <>
            <Alert tone="error">
              {restaurant.rejectionReason ??
                "Your submission was rejected. Review your details and submit again."}
            </Alert>
            <Link
              href={stepHref("details")}
              className={buttonTheme({ size: "lg", block: true })}
            >
              Fix and resubmit
            </Link>
          </>
        ) : (
          <p className="text-sm text-toned">
            We&apos;re checking your documents. You&apos;ll get an email as soon
            as {restaurant.name} is approved.
          </p>
        )}
      </div>
      <OnboardingSummary
        restaurant={restaurant}
        kyc={kyc}
        documents={documents}
        editable={false}
      />
    </OnboardingShell>
  )
}
