import { LockIcon } from "lucide-react"
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
      <aside className="sticky top-0 hidden h-svh flex-col justify-between gap-8 overflow-y-auto border-r-2 border-inverted bg-inverted p-6 text-inverted lg:flex xl:p-10">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-3xl tracking-tight uppercase"
        >
          <span
            aria-hidden
            className="grid size-8 place-items-center bg-highlight text-xl text-neutral-950"
          >
            N
          </span>
          {siteConfig.name}
        </Link>
        <div className="flex flex-col gap-8">
          <p className="font-display text-5xl leading-[0.95] uppercase xl:text-6xl">
            Put your
            <br />
            kitchen on
            <br />
            <span className="mark-highlight">the map.</span>
          </p>
          {aside}
        </div>
        <p className="flex items-start gap-2 border-t-2 border-dashed border-current pt-4 font-mono text-[11px] leading-relaxed tracking-wider uppercase opacity-80">
          <LockIcon aria-hidden className="mt-0.5 size-3.5 shrink-0" />
          Documents go to a private bucket. Bank and PAN numbers are encrypted
          at rest.
        </p>
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
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 pt-8 sm:px-6 lg:pt-12">
          {children}
        </div>
      </section>
    </main>
  )
}
