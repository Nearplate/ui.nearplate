import { Popover as PopoverPrimitive } from "@base-ui/react/popover"
import type * as React from "react"

import { cn } from "@/lib/utils"

const Popover = PopoverPrimitive.Root
const PopoverTrigger = PopoverPrimitive.Trigger

function PopoverContent({
  className,
  sideOffset = 6,
  align = "end",
  children,
  ...props
}: PopoverPrimitive.Popup.Props & {
  sideOffset?: number
  align?: PopoverPrimitive.Positioner.Props["align"]
}) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner sideOffset={sideOffset} align={align}>
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          className={cn(
            "z-50 min-w-56 border-2 border-inverted bg-default p-3 shadow-[4px_4px_0_var(--ui-border)] data-[ending-style]:opacity-0 data-[starting-style]:opacity-0",
            className
          )}
          {...props}
        >
          {children}
        </PopoverPrimitive.Popup>
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  )
}

export { Popover, PopoverContent, PopoverTrigger }
