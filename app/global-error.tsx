"use client"

import { useEffect } from "react"

import { Toaster } from "@/components/ui/toast"
import { notifyError } from "@/lib/toast"

/**
 * Root-level error boundary -- catches errors thrown by `RootLayout`
 * itself. Must render its own `<html>`/`<body>` since it replaces the
 * layout that would normally provide them.
 */
export default function GlobalError({
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
    <html lang="en">
      <body>
        <Toaster />
        <div className="mx-auto flex min-h-svh max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
          <h1 className="text-2xl font-semibold uppercase">
            Something went wrong
          </h1>
          <p className="text-sm text-muted">
            Please try again. If this keeps happening, come back later.
          </p>
          <button
            type="button"
            onClick={() => retry()}
            className="cursor-pointer border-2 border-inverted px-4 py-2 text-xs font-medium uppercase"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
