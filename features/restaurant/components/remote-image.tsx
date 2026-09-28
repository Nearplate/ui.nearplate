"use client"

import { useState } from "react"

import { cn } from "@/lib/utils"

interface RemoteImageProps {
  src: string | null
  alt: string
  className?: string
  fallback: React.ReactNode
}

/**
 * An owner-supplied image URL from any host (so it can't use `next/image`'s
 * `remotePatterns`), with a fallback shown when there is no URL or it fails
 * to load.
 */
export function RemoteImage({
  src,
  alt,
  className,
  fallback,
}: RemoteImageProps) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        {fallback}
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- owner-supplied URLs from any host
    <img
      src={src}
      alt={alt}
      className={cn("object-cover", className)}
      onError={() => setFailed(true)}
    />
  )
}
