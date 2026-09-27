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
            fill="currentColor"
            d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48Z"
          />
        </svg>
        Continue with Google
      </Button>
    </form>
  )
}
