import type * as React from "react"
import { tv, type VariantProps } from "tailwind-variants"

import { cn } from "@/lib/utils"

export const inputTheme = tv({
  base: "w-full rounded-md border-0 bg-default text-highlighted placeholder:text-dimmed ring-2 ring-accented ring-inset transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-(--input-color) disabled:cursor-not-allowed disabled:opacity-75 aria-invalid:ring-error",
  variants: {
    color: {
      primary: "[--input-color:var(--ui-primary)]",
      secondary: "[--input-color:var(--ui-secondary)]",
      success: "[--input-color:var(--ui-success)]",
      info: "[--input-color:var(--ui-info)]",
      warning: "[--input-color:var(--ui-warning)]",
      error: "[--input-color:var(--ui-error)]",
      neutral: "[--input-color:var(--ui-bg-inverted)]",
    },
    size: {
      xs: "gap-1 px-2 py-1 text-[11px]",
      sm: "gap-1.5 px-2.5 py-1 text-xs",
      md: "gap-1.5 px-3 py-1.5 text-sm",
      lg: "gap-2 px-3 py-2 text-sm",
      xl: "gap-2 px-3 py-2 text-base",
    },
  },
  defaultVariants: { color: "primary", size: "md" },
})

type InputProps = Omit<React.ComponentProps<"input">, "size" | "color"> &
  VariantProps<typeof inputTheme>

function Input({
  className,
  color,
  size,
  type = "text",
  ...props
}: InputProps) {
  return (
    <input
      data-slot="input"
      type={type}
      className={cn(inputTheme({ color, size }), className)}
      {...props}
    />
  )
}

export { Input }
export type { InputProps }
