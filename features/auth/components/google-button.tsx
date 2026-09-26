"use client"

import Script from "next/script"
import { useEffect, useRef, useTransition } from "react"

import { loginWithGoogleAction, type AuthActionState } from "../actions"
import type { SignupRole } from "../schemas"

interface GoogleIdentity {
  accounts: {
    id: {
      initialize(config: {
        client_id: string
        callback: (response: { credential: string }) => void
      }): void
      renderButton(element: HTMLElement, options: Record<string, unknown>): void
    }
  }
}

declare global {
  interface Window {
    google?: GoogleIdentity
  }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
const GOOGLE_SCRIPT_SRC = "https://accounts.google.com/gsi/client"
const FALLBACK_WIDTH_PX = 320

interface GoogleButtonProps {
  role: SignupRole
  onResult: (state: AuthActionState) => void
}

/**
 * Google Identity Services button, with its "Or continue with" divider.
 * Renders nothing when no client id is set, so the divider never appears
 * without a button beneath it.
 */
export function GoogleButton({ role, onResult }: GoogleButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const roleRef = useRef(role)
  const [, startTransition] = useTransition()

  // The GIS callback is registered once; keep it pointed at the latest role.
  useEffect(() => {
    roleRef.current = role
  }, [role])

  if (!GOOGLE_CLIENT_ID) return null

  function renderGoogleButton() {
    const container = containerRef.current
    const google = window.google
    if (!container || !google || !GOOGLE_CLIENT_ID) return

    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: ({ credential }) => {
        startTransition(async () => {
          onResult(await loginWithGoogleAction(credential, roleRef.current))
        })
      },
    })
    google.accounts.id.renderButton(container, {
      type: "standard",
      theme: "outline",
      shape: "rectangular",
      text: "continue_with",
      width: container.offsetWidth || FALLBACK_WIDTH_PX,
    })
  }

  return (
    <>
      <Script
        src={GOOGLE_SCRIPT_SRC}
        strategy="afterInteractive"
        onReady={renderGoogleButton}
      />
      <div ref={containerRef} className="flex min-h-10 justify-center" />
    </>
  )
}
