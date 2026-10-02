import type * as React from "react"
import { tv, type VariantProps } from "tailwind-variants"

import { cn } from "@/lib/utils"

export const progressTheme = tv({
  slots: {
    root: "w-full border-2 border-inverted bg-default",
    bar: "h-full bg-highlight transition-[width]",
  },
  variants: {
    size: {
      sm: { root: "h-2" },
      md: { root: "h-3" },
    },
  },
  defaultVariants: { size: "md" },
})

const MIN = 0
const MAX = 100

interface ProgressProps
  extends
    Omit<React.ComponentProps<"div">, "children">,
    VariantProps<typeof progressTheme> {
  /** 0-100. Out-of-range values are clamped. */
  value: number
  /** Accessible name; the bar has no visible text. */
  label: string
}

function Progress({ value, label, size, className, ...props }: ProgressProps) {
  const clamped = Math.min(MAX, Math.max(MIN, Math.round(value)))
  const { root, bar } = progressTheme({ size })
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={MIN}
      aria-valuemax={MAX}
      aria-valuenow={clamped}
      data-slot="progress"
      className={cn(root(), className)}
      {...props}
    >
      <div className={bar()} style={{ width: `${clamped}%` }} />
    </div>
  )
}

export { Progress }
export type { ProgressProps }
