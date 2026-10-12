import { SearchXIcon } from "lucide-react"
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
    <div className="m-4 flex flex-col items-start gap-3 border-2 border-dashed border-inverted bg-dots p-6 py-12 md:m-6 md:p-10">
      <span className="grid size-12 place-items-center border-2 border-inverted bg-highlight text-neutral-950">
        <SearchXIcon aria-hidden className="size-6" />
      </span>
      <h3 className="font-display text-4xl leading-none uppercase md:text-5xl">
        {title}
      </h3>
      <p className="max-w-md text-sm text-toned">{description}</p>
      {showReset ? (
        <Link href="/" className={buttonTheme({ size: "md" })}>
          Clear filters
        </Link>
      ) : null}
    </div>
  )
}
