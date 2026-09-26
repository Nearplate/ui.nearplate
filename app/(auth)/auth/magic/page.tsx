import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { AuthShell } from "@/features/auth/components/auth-shell"
import { MagicVerify } from "@/features/auth/components/magic-verify"

// The one-time token is in the URL: keep it out of Referer headers and indexes.
export const metadata: Metadata = {
  title: "Signing in",
  referrer: "no-referrer",
  robots: { index: false, follow: false },
}

interface MagicPageProps {
  searchParams: Promise<{ token?: string }>
}

export default async function MagicPage({ searchParams }: MagicPageProps) {
  const { token } = await searchParams
  if (!token) redirect("/auth")

  return (
    <AuthShell>
      <MagicVerify token={token} />
    </AuthShell>
  )
}
