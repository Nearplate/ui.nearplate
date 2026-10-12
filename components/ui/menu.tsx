import { Menu as MenuPrimitive } from "@base-ui/react/menu"
import type * as React from "react"

import { cn } from "@/lib/utils"

const Menu = MenuPrimitive.Root
const MenuTrigger = MenuPrimitive.Trigger

function MenuContent({
  className,
  sideOffset = 6,
  align = "end",
  children,
  ...props
}: MenuPrimitive.Popup.Props & {
  sideOffset?: number
  align?: MenuPrimitive.Positioner.Props["align"]
}) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner sideOffset={sideOffset} align={align}>
        <MenuPrimitive.Popup
          data-slot="menu-content"
          className={cn(
            "z-50 min-w-40 rounded-lg border border-default bg-default p-1 shadow-soft-lg data-[ending-style]:opacity-0 data-[starting-style]:opacity-0",
            className
          )}
          {...props}
        >
          {children}
        </MenuPrimitive.Popup>
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  )
}

function MenuItem({
  className,
  ...props
}: MenuPrimitive.Item.Props & { asChild?: boolean }) {
  return (
    <MenuPrimitive.Item
      data-slot="menu-item"
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-sm px-2.5 py-1.5 text-sm outline-none data-[highlighted]:bg-elevated data-[highlighted]:text-highlighted",
        className
      )}
      {...props}
    />
  )
}

function MenuSeparator({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="menu-separator"
      role="separator"
      className={cn("my-1 h-px bg-accented", className)}
      {...props}
    />
  )
}

export { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger }
