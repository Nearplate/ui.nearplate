import type * as React from "react"
import { tv, type VariantProps } from "tailwind-variants"

import { cn } from "@/lib/utils"

const bentoCellTheme = tv({
  base: "flex flex-col gap-2 border-b-2 border-inverted p-4 md:border-r-2 md:last:border-r-0",
  variants: {
    tone: {
      default: "bg-default text-default",
      dark: "bg-inverted text-inverted",
      highlight: "bg-highlight text-neutral-950",
    },
  },
  defaultVariants: { tone: "default" },
})

function BentoGrid({ className, ...props }: React.ComponentProps<"section">) {
  return (
    <section
      data-slot="bento-grid"
      className={cn("grid md:grid-cols-3", className)}
      {...props}
    />
  )
}

type BentoCellProps = React.ComponentProps<"div"> &
  VariantProps<typeof bentoCellTheme>

function BentoCell({ className, tone, ...props }: BentoCellProps) {
  return (
    <div
      data-slot="bento-cell"
      className={cn(bentoCellTheme({ tone }), className)}
      {...props}
    />
  )
}

function BentoTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      className={cn(
        "font-mono text-sm font-medium tracking-wider uppercase",
        className
      )}
      {...props}
    />
  )
}

export { BentoCell, BentoGrid, BentoTitle }
