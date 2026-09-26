import type * as React from "react"

import { cn } from "@/lib/utils"

function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-sm bg-elevated px-1 font-mono text-[10px] font-medium text-default ring ring-accented ring-inset",
        className
      )}
      {...props}
    />
  )
}

export { Kbd }
