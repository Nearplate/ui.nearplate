import type * as React from "react"
import { tv, type VariantProps } from "tailwind-variants"

import { cn } from "@/lib/utils"

export const alertTheme = tv({
  base: "border px-3 py-2 text-sm rounded-lg",
  variants: {
    tone: {
      neutral: "border-default bg-default text-default",
      highlight: "border-success/30 bg-tint-mint text-highlighted",
      error: "border-error bg-default text-error",
    },
  },
  defaultVariants: { tone: "neutral" },
})

type AlertProps = React.ComponentProps<"div"> & VariantProps<typeof alertTheme>

function Alert({ className, tone, ...props }: AlertProps) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      data-slot="alert"
      className={cn(alertTheme({ tone }), className)}
      {...props}
    />
  )
}

export { Alert }
export type { AlertProps }
