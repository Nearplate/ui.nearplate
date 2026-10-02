export type OnboardingFormState =
  | { status: "idle" }
  | {
      status: "error"
      message: string
      /** Input `name` -> message, shown beside the field. */
      fieldErrors?: Partial<Record<string, string>>
    }

export const IDLE_FORM: OnboardingFormState = { status: "idle" }
