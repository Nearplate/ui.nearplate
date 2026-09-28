"use client"

import { useEffect } from "react"

import { Button } from "@/components/ui/button"
import { notifyError } from "@/lib/toast"

/**
 * Route segment error boundary -- catches render errors from Server and
 * Client Components below it (e.g. an `ApiError` thrown while fetching
 * data for the page) and reports them as a toast instead of the default
 * crash screen.
 */
export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  useEffect(() => {
    notifyError("Please try again.")
  }, [error])

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="font-display text-2xl uppercase">Something went wrong</h1>
      <p className="text-sm text-muted">
        Please try again. If this keeps happening, come back later.
      </p>
      <Button onClick={() => retry()}>Try again</Button>
    </div>
  )
}
