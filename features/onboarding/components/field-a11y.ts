import type { OnboardingFormState } from "../form-state"

/** `aria-*` props wiring an input to the hint/error that `Field` renders for it. */
export function fieldA11y(
  name: string,
  state: OnboardingFormState,
  hasHint = false
): { "aria-invalid"?: true; "aria-describedby"?: string } {
  const error = state.status === "error" ? state.fieldErrors?.[name] : undefined
  const ids = [hasHint ? `${name}-hint` : null, error ? `${name}-error` : null]
    .filter(Boolean)
    .join(" ")
  return {
    ...(error ? { "aria-invalid": true as const } : {}),
    ...(ids ? { "aria-describedby": ids } : {}),
  }
}

export function fieldError(
  name: string,
  state: OnboardingFormState
): string | undefined {
  return state.status === "error" ? state.fieldErrors?.[name] : undefined
}
