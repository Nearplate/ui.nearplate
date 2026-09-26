import type * as React from "react"
import { tv, type VariantProps } from "tailwind-variants"

import { cn } from "@/lib/utils"

export const alertTheme = tv({
  base: "border-2 px-3 py-2 font-mono text-xs",
  variants: {
    tone: {
      neutral: "border-inverted bg-default text-default",
      highlight: "border-inverted bg-highlight text-neutral-950",
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
