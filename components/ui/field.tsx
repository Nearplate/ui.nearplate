import type * as React from "react"

import { cn } from "@/lib/utils"

import { Label } from "./label"

interface FieldProps extends React.ComponentProps<"div"> {
  label: string
  htmlFor: string
  /** Helper text, rendered with id `{htmlFor}-hint`. */
  hint?: string
  /** Validation message, rendered as an alert with id `{htmlFor}-error`. */
  error?: string
}

/**
 * Label + control. The control must carry the matching `id`, and should set
 * `aria-describedby` to the hint/error ids when it uses them.
 */
function Field({
  label,
  htmlFor,
  hint,
  error,
  className,
  children,
  ...props
}: FieldProps) {
  return (
    <div
      data-slot="field"
      className={cn("flex flex-col gap-1", className)}
      {...props}
    >
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint ? (
        <p id={`${htmlFor}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p
          id={`${htmlFor}-error`}
          role="alert"
          className="font-mono text-xs text-error"
        >
          {error}
        </p>
      ) : null}
    </div>
  )
}

export { Field }
export type { FieldProps }
