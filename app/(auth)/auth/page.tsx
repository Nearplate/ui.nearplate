import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { AuthForm } from "@/features/auth/components/auth-form"
import { AuthShell } from "@/features/auth/components/auth-shell"
import { signupRoleSchema } from "@/features/auth/schemas"
import { getSession } from "@/features/auth/session"

export const metadata: Metadata = { title: "Sign in" }

interface AuthPageProps {
  searchParams: Promise<{ role?: string; error?: string }>
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
        notice={
          error === "guest"
            ? "Guest access is unavailable right now. Try again shortly."
            : undefined
        }
      />
    </AuthShell>
  )
}
