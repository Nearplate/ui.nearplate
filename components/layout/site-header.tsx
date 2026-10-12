import { ArrowUpRightIcon } from "lucide-react"
import Link from "next/link"

import { siteConfig } from "@/config/site"
import { getSession } from "@/features/auth/session"
import { CartLink } from "@/features/cart/components/cart-link"

import { MobileNav } from "./mobile-nav"
import { SITE_NAV_ITEMS } from "./nav-items"

const CELL =
  "flex items-center border-l-2 border-inverted px-3.5 font-mono text-[11px] font-medium tracking-wider uppercase transition-colors"
const HOVER = "hover:bg-inverted hover:text-inverted"

/** Sticky site header: wordmark, main nav, cart and the account entry point. */
export async function SiteHeader() {
  const user = await getSession()
  const account = user
    ? {
        href: user.role === "restaurant" ? "/restaurant" : "/account",
        label: user.role === "restaurant" ? "Dashboard" : "Account",
      }
    : { href: "/auth", label: "Log in" }

  return (
    <header className="sticky top-0 z-40 flex h-(--ui-header-height) border-b-2 border-inverted bg-default">
      <Link
        href="/"
        className="flex items-center gap-2 px-3 font-display text-2xl tracking-tight uppercase"
      >
        <span
          aria-hidden
          className="ring-inverted grid size-7 place-items-center bg-highlight text-lg text-neutral-950 ring-2"
        >
          N
        </span>
        {siteConfig.name}
      </Link>
      <div className="ml-auto flex">
        <nav aria-label="Main" className="hidden md:flex">
          {SITE_NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${CELL} ${HOVER}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        {/* Below lg the cart lives in the floating bar at the bottom. */}
        <CartLink className={`${CELL} ${HOVER} hidden lg:flex`} />
        {user ? (
          <Link
            href={account.href}
            className={`${CELL} hidden gap-1.5 bg-highlight text-neutral-950 hover:bg-inverted hover:text-inverted md:flex`}
          >
            {account.label}
            <ArrowUpRightIcon aria-hidden className="size-3.5" />
          </Link>
        ) : (
          <>
            <Link href="/auth" className={`${CELL} ${HOVER} hidden md:flex`}>
              Log in
            </Link>
            <Link
              href="/#restaurants"
              className={`${CELL} gap-1.5 bg-highlight text-neutral-950 hover:bg-inverted hover:text-inverted`}
            >
              Order now
              <ArrowUpRightIcon aria-hidden className="size-3.5" />
            </Link>
          </>
        )}
        <MobileNav account={account} className="flex md:hidden" />
      </div>
    </header>
  )
}
