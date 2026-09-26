"use client"

import { Loader2Icon } from "lucide-react"
import Link from "next/link"
import { useEffect, useRef, useState, useTransition } from "react"

import { Alert } from "@/components/ui/alert"
import { buttonTheme } from "@/components/ui/button"

import { verifyMagicLinkAction, type AuthActionState } from "../actions"

interface MagicVerifyProps {
  token: string
}

function failureMessage(state: AuthActionState): string {
  if (state.status === "role_mismatch") {
    return `This email is registered as ${state.role}. Go back and pick the matching account type.`
  }
  if (state.status === "error") return state.message
  return "Something went wrong."
}

/**
 * Posts the emailed token once on mount. Verifying from JS (not on GET)
 * keeps link scanners from burning the one-time token.
 */
export function MagicVerify({ token }: MagicVerifyProps) {
  const [state, setState] = useState<AuthActionState>({ status: "idle" })
  const [, startTransition] = useTransition()
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    startTransition(async () => {
      setState(await verifyMagicLinkAction(token))
    })
  }, [token])

  if (state.status === "idle") {
    return (
      <div className="flex items-center gap-2 font-mono text-xs tracking-wider uppercase">
        <Loader2Icon aria-hidden className="size-4 animate-spin" />
        Signing you in…
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <Alert tone="error">{failureMessage(state)}</Alert>
      <Link
        href="/auth"
        className={buttonTheme({ variant: "outline", color: "neutral" })}
      >
        Request a new link
      </Link>
    </div>
  )
}
