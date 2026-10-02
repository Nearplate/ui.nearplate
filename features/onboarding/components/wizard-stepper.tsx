import { Stepper } from "@/components/ui/stepper"

import {
  ONBOARDING_STEPS,
  STEP_LABELS,
  stepHref,
  type OnboardingStep,
} from "../constants"

const STEPS = ONBOARDING_STEPS.map((id) => ({
  id,
  label: STEP_LABELS[id],
  href: stepHref(id),
}))

interface WizardStepperProps {
  current: OnboardingStep
  completed: readonly OnboardingStep[]
  /** `aside` is the vertical list on the dark panel; `inline` is the mobile/tablet bar. */
  variant: "aside" | "inline"
}

export function WizardStepper({
  current,
  completed,
  variant,
}: WizardStepperProps) {
  if (variant === "aside") {
    return (
      <Stepper
        steps={STEPS}
        current={current}
        completed={completed}
        orientation="vertical"
        tone="dark"
      />
    )
  }
  return (
    <Stepper
      steps={STEPS}
      current={current}
      completed={completed}
      className="lg:hidden"
    />
  )
}
