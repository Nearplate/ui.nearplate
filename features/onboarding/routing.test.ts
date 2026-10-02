import { describe, expect, it } from "vitest"

import type { VerificationStatus } from "@/features/restaurant/schemas"

import { onboardingRedirect, type OnboardingArea } from "./routing"

const WIZARD = "/restaurant/onboarding"
const REVIEW = "/restaurant/onboarding/review"
const PANEL = "/restaurant"

const CASES: [VerificationStatus | null, OnboardingArea, string | null][] = [
  [null, "panel", WIZARD],
  [null, "wizard", null],
  [null, "review", WIZARD],
  ["draft", "panel", WIZARD],
  ["draft", "wizard", null],
  ["draft", "review", WIZARD],
  ["pending_review", "panel", REVIEW],
  ["pending_review", "wizard", REVIEW],
  ["pending_review", "review", null],
  ["rejected", "panel", REVIEW],
  ["rejected", "wizard", null],
  ["rejected", "review", null],
  ["approved", "panel", null],
  ["approved", "wizard", PANEL],
  ["approved", "review", PANEL],
]

describe("onboardingRedirect", () => {
  it.each(CASES)("status %s on %s -> %s", (status, area, expected) => {
    expect(onboardingRedirect(status, area)).toBe(expected)
  })
})
