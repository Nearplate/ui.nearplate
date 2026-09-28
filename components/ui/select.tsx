import { Select as SelectPrimitive } from "@base-ui/react/select"
import { CheckIcon, ChevronDownIcon } from "lucide-react"
import type * as React from "react"
import { type VariantProps } from "tailwind-variants"

import { cn } from "@/lib/utils"

import { inputTheme } from "./input"

type SelectProps = Omit<React.ComponentProps<"select">, "size" | "color"> &
  VariantProps<typeof inputTheme>

/** A native `<select>` themed like `Input`, with a chevron overlay. */
function Select({ className, color, size, ...props }: SelectProps) {
  return (
    <div data-slot="select-wrapper" className="relative">
      <select
        data-slot="select"
        className={cn(
          inputTheme({ color, size }),
          "appearance-none pr-8",
          className
        )}
        {...props}
      />
      <ChevronDownIcon
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-muted"
      />
    </div>
  )
}

export { Select }
export type { SelectProps }

/**
 * Styled combobox built on Base UI's Select, for popups that need custom
 * (non-native) item rendering. Prefer `Select` for plain option lists.
 */
const Combobox = SelectPrimitive.Root
const ComboboxValue = SelectPrimitive.Value

type ComboboxTriggerProps = Omit<
  React.ComponentProps<typeof SelectPrimitive.Trigger>,
  "size" | "color"
> &
  VariantProps<typeof inputTheme>

function ComboboxTrigger({
  className,
  color,
  size,
  children,
  ...props
}: ComboboxTriggerProps) {
  return (
    <SelectPrimitive.Trigger
      data-slot="combobox-trigger"
      className={cn(
        inputTheme({ color, size }),
        "flex items-center justify-between gap-2 text-left",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon>
        <ChevronDownIcon aria-hidden className="size-3.5 text-muted" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function ComboboxContent({
  className,
  sideOffset = 6,
  align = "start",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Popup> & {
  sideOffset?: number
  align?: React.ComponentProps<typeof SelectPrimitive.Positioner>["align"]
}) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        sideOffset={sideOffset}
        align={align}
        className="z-50"
      >
        <SelectPrimitive.Popup
          data-slot="combobox-content"
          className={cn(
            "max-h-64 w-(--anchor-width) overflow-y-auto border-2 border-inverted bg-default p-1 shadow-[4px_4px_0_var(--ui-border)] data-[ending-style]:opacity-0 data-[starting-style]:opacity-0",
            className
          )}
          {...props}
        >
          <SelectPrimitive.List>{children}</SelectPrimitive.List>
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

function ComboboxItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="combobox-item"
      className={cn(
        "flex cursor-pointer items-center justify-between gap-2 px-2.5 py-1.5 font-mono text-xs font-medium tracking-wider uppercase outline-none data-[highlighted]:bg-inverted data-[highlighted]:text-inverted",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator>
        <CheckIcon aria-hidden className="size-3.5" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}

export {
  Combobox,
  ComboboxContent,
  ComboboxItem,
  ComboboxTrigger,
  ComboboxValue,
}
