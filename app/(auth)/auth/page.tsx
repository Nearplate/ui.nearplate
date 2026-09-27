import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { AuthForm, ROLE_LABELS } from "@/features/auth/components/auth-form"
import { AuthShell } from "@/features/auth/components/auth-shell"
import { signupRoleSchema } from "@/features/auth/schemas"
import { getSession } from "@/features/auth/session"

export const metadata: Metadata = { title: "Sign in" }

interface AuthPageProps {
  searchParams: Promise<{ role?: string; error?: string }>
}

function noticeFor(error: string | undefined, role: string | undefined) {
  switch (error) {
    case "guest":
      return "Guest access is unavailable right now. Try again shortly."
    case "google":
      return "Google sign-in didn't complete. Try again."
    case "role_mismatch":
      return `This email is already registered as ${
        (role && ROLE_LABELS[role]) ?? role
      }. Switch the account type above to match.`
    default:
      return undefined
  }
}

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const [{ role, error }, user] = await Promise.all([
    searchParams,
    getSession(),
  ])
  if (user) redirect("/")

  const parsedRole = signupRoleSchema.safeParse(role)

  return (
    <AuthShell>
      <AuthForm
        initialRole={parsedRole.success ? parsedRole.data : "user"}
        notice={noticeFor(error, role)}
      />
    </AuthShell>
  )
}
