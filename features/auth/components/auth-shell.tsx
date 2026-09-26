import Link from "next/link"

import { siteConfig } from "@/config/site"

interface AuthShellProps {
  children: React.ReactNode
}

/** Split-screen layout: brand panel on the left, form on the right. */
export function AuthShell({ children }: AuthShellProps) {
  return (
    <main className="grid min-h-svh lg:grid-cols-2">
      <aside className="hidden flex-col justify-between border-r-2 border-inverted bg-inverted p-6 text-inverted lg:flex">
        <Link
          href="/"
          className="font-display text-3xl tracking-tight uppercase"
        >
          {siteConfig.name}
        </Link>
        <div className="flex flex-col gap-3">
          <p className="font-display text-6xl leading-none uppercase">
            Food from
            <br />
            places you
            <br />
            <span className="bg-highlight px-2 text-neutral-950">know.</span>
          </p>
          <p className="max-w-xs font-mono text-xs tracking-wider uppercase">
            Zero commission. Local kitchens. Straight to your door.
          </p>
        </div>
      </aside>

      <section className="flex flex-col">
        <div className="flex items-center justify-between border-b-2 border-inverted lg:justify-end">
          <Link
            href="/"
            className="px-3 font-display text-2xl tracking-tight uppercase lg:hidden"
          >
            {siteConfig.name}
          </Link>
          <Link
            href="/"
            className="border-l-2 border-inverted px-3 py-2.5 font-mono text-[11px] font-medium tracking-wider uppercase hover:bg-inverted hover:text-inverted"
          >
            Back home
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="flex w-full max-w-sm flex-col gap-4">{children}</div>
        </div>
      </section>
    </main>
  )
}
