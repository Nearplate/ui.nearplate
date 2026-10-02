import Link from "next/link"
import { tv, type VariantProps } from "tailwind-variants"

import { cn } from "@/lib/utils"

export const stepperTheme = tv({
  slots: {
    list: "flex font-mono text-xs tracking-wider uppercase",
    item: "flex items-center gap-2",
    badge:
      "flex size-6 shrink-0 items-center justify-center border-2 text-[10px]",
  },
  variants: {
    orientation: {
      horizontal: { list: "flex-row gap-4", item: "flex-1" },
      vertical: { list: "flex-col gap-2", item: "" },
    },
    tone: {
      light: { badge: "border-inverted" },
      dark: { badge: "border-current" },
    },
  },
  defaultVariants: { orientation: "horizontal", tone: "light" },
})

interface StepperStep {
  id: string
  label: string
  /** Where a completed or current step links to. */
  href: string
}

interface StepperProps extends VariantProps<typeof stepperTheme> {
  steps: readonly StepperStep[]
  current: string
  completed: readonly string[]
  className?: string
}

/**
 * Mobile: "Step 2 of 4 · Identity" over a segmented bar. From `md` up (or
 * always, when vertical): numbered steps. Completed and current steps link.
 */
function Stepper({
  steps,
  current,
  completed,
  orientation,
  tone,
  className,
}: StepperProps) {
  const theme = stepperTheme({ orientation, tone })
  const currentIndex = Math.max(
    0,
    steps.findIndex((step) => step.id === current)
  )
  const isVertical = orientation === "vertical"

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {isVertical ? null : (
        <div className="flex flex-col gap-2 md:hidden">
          <p className="font-mono text-xs tracking-wider uppercase">
            {`Step ${currentIndex + 1} of ${steps.length} · ${steps[currentIndex]?.label}`}
          </p>
          <div aria-hidden className="flex gap-1.5">
            {steps.map((step, i) => (
              <span
                key={step.id}
                className={cn(
                  "h-1 flex-1",
                  i <= currentIndex ? "bg-highlight" : "bg-accented"
                )}
              />
            ))}
          </div>
        </div>
      )}
      <ol className={cn(theme.list(), isVertical ? "" : "hidden md:flex")}>
        {steps.map((step, i) => {
          const isCurrent = step.id === current
          const isDone = completed.includes(step.id)
          const content = (
            <>
              <span
                className={cn(
                  theme.badge(),
                  isDone && !isCurrent && "bg-highlight text-neutral-950",
                  isCurrent && "bg-inverted text-inverted"
                )}
              >
                {i + 1}
              </span>
              {step.label}
            </>
          )
          return (
            <li
              key={step.id}
              aria-current={isCurrent ? "step" : undefined}
              className={theme.item()}
            >
              {isDone || isCurrent ? (
                <Link href={step.href} className="flex items-center gap-2">
                  {content}
                </Link>
              ) : (
                <span className="flex items-center gap-2 text-muted">
                  {content}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

export { Stepper }
export type { StepperProps, StepperStep }
