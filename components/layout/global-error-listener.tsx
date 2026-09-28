"use client"

import { useEffect } from "react"

import { notifyError } from "@/lib/toast"

/**
 * Mounted once in the root layout. Catches errors that never reach a React
 * error boundary -- thrown in event handlers, timers, or rejected promises
 * -- and surfaces them as a toast instead of failing silently.
 */
export function GlobalErrorListener() {
  useEffect(() => {
    function handleError(event: ErrorEvent) {
      notifyError(event.message || "Please try again.")
    }
    function handleRejection(event: PromiseRejectionEvent) {
      const reason = event.reason
      const message =
        reason instanceof Error ? reason.message : "Please try again."
      notifyError(message)
    }

    window.addEventListener("error", handleError)
    window.addEventListener("unhandledrejection", handleRejection)
    return () => {
      window.removeEventListener("error", handleError)
      window.removeEventListener("unhandledrejection", handleRejection)
    }
  }, [])

  return null
}
