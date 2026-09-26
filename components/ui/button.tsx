import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { Loader2Icon } from "lucide-react"
import { tv, type VariantProps } from "tailwind-variants"

import { cn } from "@/lib/utils"

/**
 * Mirrors Nuxt UI's Button theme (color x variant x size). Each color sets
 * `--btn-color`, so variant styles are written once instead of per color.
 * `neutral` uses surface tokens instead of a palette and overrides below.
 */
export const buttonTheme = tv({
  base: "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-md font-mono font-medium tracking-wider whitespace-nowrap uppercase transition-colors select-none focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-75 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  variants: {
    color: {
      primary: "[--btn-color:var(--ui-primary)]",
      secondary: "[--btn-color:var(--ui-secondary)]",
      success: "[--btn-color:var(--ui-success)]",
      info: "[--btn-color:var(--ui-info)]",
      warning: "[--btn-color:var(--ui-warning)]",
      error: "[--btn-color:var(--ui-error)]",
      neutral: "",
    },
    variant: {
      solid:
        "text-inverted bg-(--btn-color) hover:bg-(--btn-color)/75 focus-visible:outline-(--btn-color)",
      outline:
        "text-(--btn-color) ring-2 ring-current ring-inset hover:bg-(--btn-color)/10 focus-visible:outline-(--btn-color)",
      soft: "text-(--btn-color) bg-(--btn-color)/10 hover:bg-(--btn-color)/15 focus-visible:outline-(--btn-color)",
      subtle:
        "text-(--btn-color) bg-(--btn-color)/10 ring-2 ring-(--btn-color)/25 ring-inset hover:bg-(--btn-color)/15 focus-visible:outline-(--btn-color)",
      ghost:
        "text-(--btn-color) hover:bg-(--btn-color)/10 focus-visible:outline-(--btn-color)",
      link: "text-(--btn-color) hover:text-(--btn-color)/75 focus-visible:outline-(--btn-color)",
    },
    size: {
      xs: "gap-1 px-2 py-1 text-[10px] [&_svg]:size-3.5",
      sm: "gap-1.5 px-2.5 py-1 text-[11px] [&_svg]:size-3.5",
      md: "gap-1.5 px-3 py-1.5 text-xs [&_svg]:size-4",
      lg: "gap-2 px-4 py-2 text-xs [&_svg]:size-4",
      xl: "gap-2 px-5 py-2.5 text-sm [&_svg]:size-5",
    },
    block: { true: "w-full" },
    square: { true: "" },
  },
  compoundVariants: [
    {
      color: "neutral",
      variant: "solid",
      class:
        "text-inverted bg-inverted hover:bg-inverted/90 focus-visible:outline-inverted",
    },
    {
      color: "neutral",
      variant: "outline",
      class:
        "text-default bg-default ring-2 ring-accented hover:bg-elevated focus-visible:outline-inverted",
    },
    {
      color: "neutral",
      variant: "soft",
      class:
        "text-default bg-elevated hover:bg-accented/75 focus-visible:outline-inverted",
    },
    {
      color: "neutral",
      variant: "subtle",
      class:
        "text-default bg-elevated ring-2 ring-accented hover:bg-accented/75 focus-visible:outline-inverted",
    },
    {
      color: "neutral",
      variant: "ghost",
      class: "text-default hover:bg-elevated focus-visible:outline-inverted",
    },
    {
      color: "neutral",
      variant: "link",
      class: "text-muted hover:text-default focus-visible:outline-inverted",
    },
    { square: true, size: "xs", class: "p-1" },
    { square: true, size: "sm", class: "p-1.5" },
    { square: true, size: "md", class: "p-1.5" },
    { square: true, size: "lg", class: "p-2" },
    { square: true, size: "xl", class: "p-2" },
  ],
  defaultVariants: {
    color: "primary",
    variant: "solid",
    size: "md",
  },
})

type ButtonProps = ButtonPrimitive.Props &
  VariantProps<typeof buttonTheme> & {
    loading?: boolean
  }

function Button({
  className,
  color,
  variant,
  size,
  block,
  square,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      disabled={disabled || loading}
      className={cn(
        buttonTheme({ color, variant, size, block, square }),
        className
      )}
      {...props}
    >
      {loading ? <Loader2Icon aria-hidden className="animate-spin" /> : null}
      {children}
    </ButtonPrimitive>
  )
}

export { Button }
export type { ButtonProps }
