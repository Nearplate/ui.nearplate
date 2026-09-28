import Link from "next/link"

import { Button } from "@/components/ui/button"

interface PaginationProps {
  page: number
  totalPages: number
}

/** Previous/next links for the orders tab, keeping `?tab=orders`. */
export function Pagination({ page, totalPages }: PaginationProps) {
  if (totalPages <= 1) return null

  const hasPrevious = page > 1
  const hasNext = page < totalPages

  return (
    <div className="flex items-center justify-between border-t-2 border-muted pt-2">
      {hasPrevious ? (
        <Button
          render={<Link href={`?tab=orders&page=${page - 1}`} scroll={false} />}
          variant="outline"
          color="neutral"
          size="sm"
        >
          Previous
        </Button>
      ) : (
        <Button variant="outline" color="neutral" size="sm" disabled>
          Previous
        </Button>
      )}
      <span className="font-mono text-xs text-muted uppercase">
        Page {page} / {totalPages}
      </span>
      {hasNext ? (
        <Button
          render={<Link href={`?tab=orders&page=${page + 1}`} scroll={false} />}
          variant="outline"
          color="neutral"
          size="sm"
        >
          Next
        </Button>
      ) : (
        <Button variant="outline" color="neutral" size="sm" disabled>
          Next
        </Button>
      )}
    </div>
  )
}
