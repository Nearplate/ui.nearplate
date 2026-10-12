import Link from "next/link"

import { siteConfig } from "@/config/site"

const COLUMNS = [
  {
    title: "Order",
    links: [
      { href: "/#restaurants", label: "Restaurants near you" },
      { href: "/?veg=1", label: "Pure veg" },
      { href: "/cart", label: "Your cart" },
      { href: "/account", label: "Your orders" },
    ],
  },
  {
    title: "Restaurants",
    links: [
      { href: "/partners", label: "Why NearPlate" },
      { href: "/auth?role=restaurant", label: "List your kitchen" },
      { href: "/restaurant", label: "Restaurant dashboard" },
    ],
  },
] as const

/** Site footer: oversized wordmark, link columns and the commission promise. */
export function SiteFooter() {
  return (
    <footer className="border-t-2 border-inverted bg-inverted text-inverted">
      <div className="grid gap-8 px-4 py-10 md:grid-cols-[1.5fr_1fr_1fr] md:px-6">
        <div className="flex flex-col gap-3">
          <p className="max-w-sm font-display text-4xl leading-[0.95] uppercase">
            Order local.
            <br />
            <span className="text-highlight">Pay menu price.</span>
          </p>
          <p className="max-w-sm text-sm opacity-75">
            {siteConfig.description} Every rupee on the menu goes to the kitchen
            that cooked it.
          </p>
        </div>
        {COLUMNS.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h2 className="mb-3 font-mono text-[11px] tracking-wider text-highlight uppercase">
              {column.title}
            </h2>
            <ul className="flex flex-col gap-2">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-highlight hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <p
        aria-hidden
        className="overflow-hidden px-2 font-display text-[25.5vw] leading-[0.85] tracking-tighter whitespace-nowrap uppercase select-none"
      >
        {siteConfig.name}
      </p>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t-2 border-inverted bg-highlight px-4 py-2 font-mono text-[11px] tracking-wider text-neutral-950 uppercase md:px-6">
        <span>
          © {new Date().getFullYear()} {siteConfig.name}
        </span>
        <span>0% commission. Always.</span>
      </div>
    </footer>
  )
}
