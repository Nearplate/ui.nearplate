import Link from "next/link"

import { Button } from "@/components/ui/button"
import { siteConfig } from "@/config/site"
import { logoutAction } from "@/features/auth/actions"

interface OnboardingShellProps {
  /** Step list shown in the dark aside from `lg` up. */
  aside: React.ReactNode
  children: React.ReactNode
}

/**
 * Split-screen onboarding frame. Mobile: one column with a slim top bar.
 * `lg` and up: dark aside with the step list next to the content.
 */
export function OnboardingShell({ aside, children }: OnboardingShellProps) {
  return (
    <main className="grid min-h-svh lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <aside className="hidden flex-col justify-between gap-8 border-r-2 border-inverted bg-inverted p-6 text-inverted lg:flex">
        <Link
          href="/"
          className="font-display text-3xl tracking-tight uppercase"
        >
          {siteConfig.name}
        </Link>
        <div className="flex flex-col gap-6">
          <p className="font-display text-5xl leading-none uppercase">
            Put your
            <br />
            kitchen on
            <br />
            <span className="bg-highlight px-2 text-neutral-950">the map.</span>
          </p>
          {aside}
        </div>
      </aside>
      <section className="flex min-w-0 flex-col">
        <header className="flex items-center justify-between border-b-2 border-inverted p-4 sm:px-6 lg:justify-end">
          <Link href="/" className="font-display text-2xl uppercase lg:hidden">
            {siteConfig.name}
          </Link>
          <form action={logoutAction}>
            <Button type="submit" variant="ghost" color="neutral" size="sm">
              Sign out
            </Button>
          </form>
        </header>
        <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 pt-6 sm:px-6">
          {children}
        </div>
      </section>
    </main>
  )
}
