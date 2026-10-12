import Link from "next/link"

import { cn } from "@/lib/utils"

import type { FeedFilters } from "../location"

interface CategoryRailProps {
  cuisines: string[]
  filters: FeedFilters
}

const CHIP =
  "shrink-0 snap-start rounded-full border border-default px-3.5 py-1.5 text-[13px] font-medium transition-colors duration-150"
const ACTIVE = "border-inverted bg-inverted text-inverted"
const IDLE = "bg-default hover:border-success hover:bg-tint-mint"

function Chip({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "page" : undefined}
      className={cn(CHIP, active ? ACTIVE : IDLE)}
    >
      {children}
    </Link>
  )
}

/** Horizontal, scroll-snapping category chips; each is a plain link to a filtered feed. */
export function CategoryRail({ cuisines, filters }: CategoryRailProps) {
  const showingAll = !filters.cuisine && !filters.veg

  return (
    <nav
      aria-label="Categories"
      className="no-scrollbar flex snap-x scroll-px-4 gap-2 overflow-x-auto border-b border-default px-4 py-2.5 md:px-6"
    >
      <Chip href="/" active={showingAll}>
        All
      </Chip>
      <Chip href="/?veg=1" active={filters.veg && !filters.cuisine}>
        Pure veg
      </Chip>
      {cuisines.map((cuisine) => (
        <Chip
          key={cuisine}
          href={`/?cuisine=${encodeURIComponent(cuisine)}`}
          active={filters.cuisine === cuisine}
        >
          {cuisine}
        </Chip>
      ))}
    </nav>
  )
}
