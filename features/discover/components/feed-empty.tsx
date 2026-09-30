import Link from "next/link"

import { buttonTheme } from "@/components/ui/button"

interface FeedEmptyProps {
  title: string
  description: string
  /** Offer a way back to the unfiltered feed. */
  showReset?: boolean
}

/** Empty / error state for the feed. */
export function FeedEmpty({ title, description, showReset }: FeedEmptyProps) {
  return (
    <div className="flex flex-col items-start gap-3 p-4 py-10">
      <h3 className="font-display text-4xl leading-none uppercase">{title}</h3>
      <p className="max-w-md text-sm text-toned">{description}</p>
      {showReset ? (
        <Link href="/" className={buttonTheme({ size: "sm" })}>
          Clear filters
        </Link>
      ) : null}
    </div>
  )
}
