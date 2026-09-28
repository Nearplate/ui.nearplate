import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardBody, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { logoutAction, updateProfileAction } from "@/features/auth/actions"
import { NameForm } from "@/features/auth/components/name-form"
import { getSession } from "@/features/auth/session"

export const metadata: Metadata = { title: "Account" }

export default async function AccountPage() {
  const user = await getSession()
  if (!user) redirect("/auth")
  if (user.role === "restaurant") redirect("/restaurant")
  if (!user.isOnboarded) redirect("/onboarding")

  return (
    <section className="mx-auto flex w-full max-w-xl flex-col gap-4 p-4 md:p-6">
      <h1 className="font-display text-4xl uppercase">Your account</h1>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <span className="font-mono text-sm break-all">{user.email}</span>
          <Badge variant="soft" color="neutral">
            {user.role}
          </Badge>
        </CardHeader>
        <Separator />
        <CardBody>
          <NameForm
            action={updateProfileAction}
            submitLabel="Save changes"
            defaultFirstName={user.firstName ?? ""}
            defaultLastName={user.lastName ?? ""}
            successMessage="Profile updated."
          />
        </CardBody>
      </Card>

      <form action={logoutAction}>
        <Button type="submit" variant="outline" color="neutral">
          Log out
        </Button>
      </form>
    </section>
  )
}
