"use client"

import { ArrowRightIcon } from "lucide-react"
import { useActionState, useState } from "react"

import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

import {
  continueAsGuestAction,
  requestMagicLinkAction,
  type AuthActionState,
} from "../actions"
import type { SignupRole } from "../schemas"
import { GoogleButton } from "./google-button"
import { RoleToggle } from "./role-toggle"

const IDLE: AuthActionState = { status: "idle" }

export const ROLE_LABELS: Record<string, string> = {
  user: "a customer",
  restaurant: "a restaurant",
  admin: "an admin",
}

interface AuthFormProps {
  initialRole: SignupRole
  /** Shown when a previous step failed before reaching this form. */
  notice?: string
}

/** Owns the reset key so "use a different email" remounts a clean form. */
export function AuthForm(props: AuthFormProps) {
  const [attempt, setAttempt] = useState(0)
  return (
    <AuthFormBody
      key={attempt}
      {...props}
      onReset={() => setAttempt((count) => count + 1)}
    />
  )
}

function AuthFormBody({
  initialRole,
  notice,
  onReset,
}: AuthFormProps & { onReset: () => void }) {
  const [role, setRole] = useState<SignupRole>(initialRole)
  const [state, formAction, isPending] = useActionState(
    requestMagicLinkAction,
    IDLE
  )

  if (state.status === "sent") {
    return (
      <div className="flex flex-col gap-3">
        <h1 className="font-display text-4xl uppercase">Check your inbox</h1>
        <Alert tone="highlight">
          We sent a sign-in link to {state.email}. It expires in 15 minutes.
        </Alert>
        <Button variant="outline" color="neutral" onClick={onReset}>
          Use a different email
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-4xl uppercase">Sign in or sign up</h1>
        <p className="text-sm text-muted">
          Enter your email. We&apos;ll send a link, no password needed.
        </p>
      </div>

      {notice ? <Alert tone="error">{notice}</Alert> : null}
      {state.status === "error" ? (
        <Alert tone="error">{state.message}</Alert>
      ) : null}
      {state.status === "role_mismatch" ? (
        <Alert tone="error">
          This email is already registered as{" "}
          {ROLE_LABELS[state.role] ?? state.role}. Switch the account type above
          to match.
        </Alert>
      ) : null}

      <form action={formAction} className="flex flex-col gap-3">
        <RoleToggle value={role} onChange={setRole} />
        <Field label="Email" htmlFor="email">
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            required
          />
        </Field>
        <Button type="submit" size="lg" block loading={isPending}>
          Continue with email
          <ArrowRightIcon aria-hidden />
        </Button>
      </form>

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="font-mono text-[11px] tracking-wider whitespace-nowrap uppercase">
          Or continue with
        </span>
        <Separator className="flex-1" />
      </div>

      <GoogleButton role={role} />

      <form action={continueAsGuestAction}>
        <Button type="submit" variant="outline" color="neutral" block>
          Browse as guest
        </Button>
      </form>

      <p className="text-center text-xs text-muted">
        By continuing, you agree to NearPlate&apos;s terms of service and
        privacy policy.
      </p>
    </div>
  )
}
