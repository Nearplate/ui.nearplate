import type * as React from "react"

import { cn } from "@/lib/utils"

import { inputTheme } from "./input"

type TextareaProps = React.ComponentProps<"textarea">

function Textarea({ className, rows = 3, ...props }: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      rows={rows}
      className={cn(inputTheme({ size: "md" }), "resize-y", className)}
      {...props}
    />
  )
}

export { Textarea }
export type { TextareaProps }
