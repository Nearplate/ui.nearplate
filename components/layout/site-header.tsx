import { ArrowUpRightIcon } from "lucide-react"
import Link from "next/link"

import { siteConfig } from "@/config/site"
import { getSession } from "@/features/auth/session"
import { CartLink } from "@/features/cart/components/cart-link"

const NAV_ITEMS = [
  { href: "/#restaurants", label: "Restaurants" },
  { href: "/#how", label: "How it works" },
  { href: "/#partners", label: "Partners" },
] as const

const CELL =
  "flex items-center border-l-2 border-inverted px-3 py-2.5 font-mono text-[11px] font-medium tracking-wider uppercase"

export async function SiteHeader() {
  const user = await getSession()
  const accountHref = user
    ? user.role === "restaurant"
      ? "/restaurant"
      : "/account"
    : "/auth"

  return (
    <header className="flex border-b-2 border-inverted bg-default">
      <Link
        href="/"
        className="flex items-center px-3 font-display text-2xl tracking-tight uppercase"
      >
        {siteConfig.name}
      </Link>
      <div className="ml-auto flex">
        <nav aria-label="Main" className="hidden md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${CELL} hover:bg-inverted hover:text-inverted`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <CartLink className={`${CELL} hover:bg-inverted hover:text-inverted`} />
        {user ? (
          <Link href={accountHref} className={`${CELL} gap-1.5 bg-highlight`}>
            Account
            <ArrowUpRightIcon aria-hidden className="size-3.5" />
          </Link>
        ) : (
          <>
            <Link
              href={accountHref}
              className={`${CELL} hover:bg-inverted hover:text-inverted`}
            >
              Log in
            </Link>
            <Link
              href="/#restaurants"
              className={`${CELL} gap-1.5 bg-highlight`}
            >
              Order now
              <ArrowUpRightIcon aria-hidden className="size-3.5" />
            </Link>
          </>
        )}
      </div>
    </header>
  )
}
