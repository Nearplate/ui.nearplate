"use client"

import { CheckIcon, Share2Icon } from "lucide-react"
import { useState } from "react"

import { Button, type ButtonProps } from "@/components/ui/button"

interface ShareButtonProps extends Omit<ButtonProps, "children"> {
  title: string
  url: string
}

const RESET_DELAY_MS = 2000

/** Opens the native share sheet, falling back to copying the link. */
export function ShareButton({ title, url, ...props }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleClick() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), RESET_DELAY_MS)
      }
      return
    }
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), RESET_DELAY_MS)
  }

  return (
    <Button type="button" onClick={handleClick} {...props}>
      {copied ? (
        <CheckIcon aria-hidden className="size-3.5" />
      ) : (
        <Share2Icon aria-hidden className="size-3.5" />
      )}
      {copied ? "Copied" : "Share"}
    </Button>
  )
}
