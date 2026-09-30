import Link from "next/link"

import { cn } from "@/lib/utils"

import type { FeedFilters } from "../location"

interface CategoryRailProps {
  cuisines: string[]
  filters: FeedFilters
}

const CHIP =
  "shrink-0 snap-start border-2 border-inverted px-2.5 py-1 font-mono text-[11px] font-medium tracking-wider uppercase transition-colors"
const ACTIVE = "bg-inverted text-inverted"
const IDLE = "bg-default hover:bg-highlight hover:text-neutral-950"

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
      className="flex snap-x scroll-px-4 gap-1.5 overflow-x-auto border-b-2 border-inverted px-4 py-2.5"
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
