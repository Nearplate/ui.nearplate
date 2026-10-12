import Link from "next/link"

import { siteConfig } from "@/config/site"
import { ReceiptCard } from "@/features/marketing/components/receipt-card"

interface AuthShellProps {
  children: React.ReactNode
}

/** Split-screen layout: brand panel on the left, form on the right. */
export function AuthShell({ children }: AuthShellProps) {
  return (
    <main className="grid min-h-svh lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r-2 border-inverted bg-inverted p-6 text-inverted lg:flex xl:p-10">
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
        <ReceiptCard className="absolute top-1/2 right-[-3rem] -translate-y-1/2 rotate-6 shadow-[8px_8px_0_var(--ui-highlight)] xl:right-10" />
        <div className="relative flex flex-col gap-4">
          <p className="font-display text-6xl leading-[0.95] uppercase xl:text-7xl">
            Food from
            <br />
            places you
            <br />
            <span className="mark-highlight">know.</span>
          </p>
          <ul className="flex flex-wrap gap-2 font-mono text-[11px] tracking-wider uppercase">
            {["Zero commission", "Local kitchens", "Menu prices"].map(
              (perk) => (
                <li
                  key={perk}
                  className="border-2 border-current px-2 py-1 opacity-90"
                >
                  {perk}
                </li>
              )
            )}
          </ul>
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
