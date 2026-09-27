"use client"

import { Button } from "@/components/ui/button"

import { startGoogleAction } from "../actions"
import type { SignupRole } from "../schemas"

interface GoogleButtonProps {
  role: SignupRole
}

/**
 * "Continue with Google" button, styled and behaving like "Browse as
 * guest": a plain form submit that posts to a server action, which
 * redirects the browser to Google. No client-side script or embedded
 * widget -- the button always renders.
 */
export function GoogleButton({ role }: GoogleButtonProps) {
  return (
    <form action={startGoogleAction}>
      <input type="hidden" name="role" value={role} />
      <Button type="submit" variant="outline" color="neutral" block>
        <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
          <path
            fill="#4285F4"
            d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82Z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.95H1.27v3.11A12 12 0 0 0 12 24Z"
          />
          <path
            fill="#FBBC05"
            d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.6H1.27a12 12 0 0 0 0 10.8l4-3.11Z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.76 0 3.34.6 4.59 1.79l3.44-3.44A11.4 11.4 0 0 0 12 0 12 12 0 0 0 1.27 6.6l4 3.11C6.22 6.86 8.87 4.75 12 4.75Z"
          />
        </svg>
        Continue with Google
      </Button>
    </form>
  )
}
