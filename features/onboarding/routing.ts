import type { VerificationStatus } from "@/features/restaurant/schemas"

import { ONBOARDING_PATH, PANEL_PATH, REVIEW_PATH } from "./constants"

export type OnboardingArea = "panel" | "wizard" | "review"

/**
 * The single redirect rule for restaurant owners: where `area` should send
 * someone whose restaurant has `status` (`null` = no restaurant yet), or
 * `null` to stay. Enforced server-side in layouts/pages; `proxy.ts` can't
 * see the status.
 */
export function onboardingRedirect(
  status: VerificationStatus | null,
  area: OnboardingArea
): string | null {
  if (status === "approved") return area === "panel" ? null : PANEL_PATH

  if (status === "pending_review") return area === "review" ? null : REVIEW_PATH

  // no restaurant, draft or rejected
  if (area === "wizard") return null
  const isRejected = status === "rejected"
  if (area === "review") return isRejected ? null : ONBOARDING_PATH
  return isRejected ? REVIEW_PATH : ONBOARDING_PATH
}
