import type * as React from "react"
import { tv, type VariantProps } from "tailwind-variants"

import { cn } from "@/lib/utils"

export const badgeTheme = tv({
  base: "inline-flex items-center rounded-md font-medium",
  variants: {
    color: {
      primary: "[--badge-color:var(--ui-primary)]",
      secondary: "[--badge-color:var(--ui-secondary)]",
      success: "[--badge-color:var(--ui-success)]",
      info: "[--badge-color:var(--ui-info)]",
      warning: "[--badge-color:var(--ui-warning)]",
      error: "[--badge-color:var(--ui-error)]",
      neutral: "",
    },
    variant: {
      solid: "text-inverted bg-(--badge-color)",
      outline: "text-(--badge-color) ring ring-current ring-inset",
      soft: "text-(--badge-color) bg-(--badge-color)/10",
      subtle:
        "text-(--badge-color) bg-(--badge-color)/10 ring ring-(--badge-color)/25 ring-inset",
    },
    size: {
      sm: "px-1.5 py-0.5 text-[10px]/3",
      md: "px-2 py-1 text-xs",
      lg: "px-2.5 py-1 text-sm",
    },
  },
  compoundVariants: [
    { color: "neutral", variant: "solid", class: "text-inverted bg-inverted" },
    {
      color: "neutral",
      variant: "outline",
      class: "text-default bg-default ring-accented",
    },
    { color: "neutral", variant: "soft", class: "text-default bg-elevated" },
    {
      color: "neutral",
      variant: "subtle",
      class: "text-default bg-elevated ring-accented",
    },
  ],
  defaultVariants: { color: "primary", variant: "solid", size: "md" },
})

type BadgeProps = React.ComponentProps<"span"> & VariantProps<typeof badgeTheme>

function Badge({ className, color, variant, size, ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeTheme({ color, variant, size }), className)}
      {...props}
    />
  )
}

export { Badge }
export type { BadgeProps }
