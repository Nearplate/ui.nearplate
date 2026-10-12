"use client"

import { ArrowUpRightIcon, MenuIcon, XIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

import { cn } from "@/lib/utils"

import { SITE_NAV_ITEMS } from "./nav-items"

interface MobileNavProps {
  account: { href: string; label: string }
  className?: string
}

/** Below `md`: a menu button that drops a full-width panel under the header. */
export function MobileNav({ account, className }: MobileNavProps) {
  const pathname = usePathname()
  // Open "for" one path, so navigating anywhere closes the panel.
  const [openOn, setOpenOn] = useState<string | null>(null)
  const open = openOn === pathname
  const setOpen = (value: boolean) => setOpenOn(value ? pathname : null)

  useEffect(() => {
    if (!open) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenOn(null)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open])

  return (
    <div className={className}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen(!open)}
        className="flex cursor-pointer items-center rounded-md p-2 text-highlighted hover:bg-elevated"
      >
        {open ? (
          <XIcon aria-hidden className="size-5" />
        ) : (
          <MenuIcon aria-hidden className="size-5" />
        )}
      </button>
      <nav
        id="mobile-nav"
        aria-label="Main"
        hidden={!open}
        className="absolute inset-x-0 top-full z-40 border-b border-default bg-default motion-safe:animate-rise"
      >
        <ul className="flex flex-col">
          {SITE_NAV_ITEMS.map((item, index) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between border-b border-default px-4 py-4 text-2xl font-light tracking-tight hover:bg-tint-mint"
              >
                {item.label}
                <span className="font-mono text-xs text-muted">
                  0{index + 1}
                </span>
              </Link>
            </li>
          ))}
          <li>
            <Link
              href={account.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center justify-between bg-inverted px-4 py-4 text-sm font-medium text-inverted"
              )}
            >
              {account.label}
              <ArrowUpRightIcon aria-hidden className="size-4 text-highlight" />
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  )
}
