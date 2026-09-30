import { ArrowLeftIcon } from "lucide-react"
import Link from "next/link"

import { cn } from "@/lib/utils"

interface BackLinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

/** Small "go back" link for the top of a page. Links to a fixed parent so it works on direct visits too. */
export function BackLink({ href, children, className }: BackLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "focus-visible:outline-inverted inline-flex w-fit items-center gap-1.5 py-1 font-mono text-[11px] font-medium tracking-wider text-muted uppercase hover:text-default focus-visible:outline-2 focus-visible:outline-offset-2",
        className
      )}
    >
      <ArrowLeftIcon aria-hidden className="size-3.5" />
      {children}
    </Link>
  )
}
