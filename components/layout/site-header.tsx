import { ArrowUpRightIcon } from "lucide-react"
import Link from "next/link"

import { siteConfig } from "@/config/site"
import { getSession } from "@/features/auth/session"
import { CartLink } from "@/features/cart/components/cart-link"

import { MobileNav } from "./mobile-nav"
import { SITE_NAV_ITEMS } from "./nav-items"

const LINK =
  "flex items-center rounded-md px-3 py-1.5 text-sm text-muted transition-colors hover:bg-elevated hover:text-highlighted"
const CTA =
  "flex items-center gap-1.5 rounded-md bg-inverted px-3.5 py-1.5 text-sm font-medium text-inverted transition-colors hover:bg-inverted/90"

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
    <header className="bg-page/90 sticky top-0 z-40 h-(--ui-header-height) border-b border-default backdrop-blur">
      <div className="mx-auto flex h-full max-w-7xl items-center gap-2 px-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-base font-semibold tracking-tight text-highlighted"
        >
          <span
            aria-hidden
            className="grid size-7 place-items-center rounded-md bg-inverted text-sm font-semibold text-highlight"
          >
            N
          </span>
          {siteConfig.name}
        </Link>
        <nav aria-label="Main" className="ml-6 hidden gap-1 md:flex">
          {SITE_NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className={LINK}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1.5">
          {/* Below lg the cart lives in the floating bar at the bottom. */}
          <CartLink className={`${LINK} hidden lg:flex`} />
          {user ? (
            <Link href={account.href} className={`${CTA} hidden md:flex`}>
              {account.label}
              <ArrowUpRightIcon aria-hidden className="size-3.5" />
            </Link>
          ) : (
            <>
              <Link href="/auth" className={`${LINK} hidden md:flex`}>
                Log in
              </Link>
              <Link href="/#restaurants" className={CTA}>
                Order now
                <ArrowUpRightIcon aria-hidden className="size-3.5" />
              </Link>
            </>
          )}
          <MobileNav account={account} className="flex md:hidden" />
        </div>
      </div>
    </header>
  )
}
