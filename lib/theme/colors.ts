/**
 * Semantic color aliases, mirroring Nuxt UI's `ui.colors`.
 * Each alias maps to a Tailwind palette in `app/globals.css`.
 */
export const SEMANTIC_COLORS = [
  "primary",
  "secondary",
  "success",
  "info",
  "warning",
  "error",
  "neutral",
] as const

export type SemanticColor = (typeof SEMANTIC_COLORS)[number]

export const BUTTON_VARIANTS = [
  "solid",
  "outline",
  "soft",
  "subtle",
  "ghost",
  "link",
] as const

export type ButtonVariant = (typeof BUTTON_VARIANTS)[number]
