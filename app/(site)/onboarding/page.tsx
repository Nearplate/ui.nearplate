import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { onboardAction } from "@/features/auth/actions"
import { NameForm } from "@/features/auth/components/name-form"
import { getSession } from "@/features/auth/session"

export const metadata: Metadata = { title: "Welcome" }

export default async function OnboardingPage() {
  const user = await getSession()
  if (!user) redirect("/auth")
  if (user.isOnboarded) redirect("/")

  return (
    <section className="mx-auto flex w-full max-w-md flex-col gap-4 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-4xl uppercase">One last thing</h1>
        <p className="text-sm text-muted">
          Tell us your name so restaurants know who to call.
        </p>
      </div>
      <NameForm action={onboardAction} submitLabel="Finish" />
    </section>
  )
}
