"use client"

import { CheckIcon, CopyIcon } from "lucide-react"
import { useState } from "react"

import { Button, type ButtonProps } from "@/components/ui/button"

interface CopyButtonProps extends Omit<ButtonProps, "children"> {
  value: string
}

const RESET_DELAY_MS = 2000

/** Copies `value` to the clipboard and briefly shows a confirmation. */
export function CopyButton({ value, ...props }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleClick() {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), RESET_DELAY_MS)
  }

  return (
    <Button type="button" onClick={handleClick} {...props}>
      {copied ? (
        <CheckIcon aria-hidden className="size-3.5" />
      ) : (
        <CopyIcon aria-hidden className="size-3.5" />
      )}
      {copied ? "Copied" : "Copy"}
    </Button>
  )
}
