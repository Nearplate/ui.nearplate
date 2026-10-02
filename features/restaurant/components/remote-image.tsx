"use client"

import { useState } from "react"

import { cn } from "@/lib/utils"

import { DefaultAvatar, DefaultBanner, DefaultDish } from "./default-image"

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
      loading="lazy"
      decoding="async"
      className={cn("object-cover", className)}
      onError={() => setFailed(true)}
    />
  )
}

interface NamedImageProps {
  src: string | null
  name: string
  className?: string
}

/** A restaurant logo, or a coloured initial when it has none. */
export function RestaurantLogo({ src, name, className }: NamedImageProps) {
  return (
    <RemoteImage
      src={src}
      alt={`${name} logo`}
      className={cn("size-full", className)}
      fallback={<DefaultAvatar name={name} />}
    />
  )
}

/** A restaurant banner (decorative), or a tinted pattern when it has none. */
export function RestaurantBanner({ src, name, className }: NamedImageProps) {
  return (
    <RemoteImage
      src={src}
      alt=""
      className={cn("size-full", className)}
      fallback={<DefaultBanner name={name} />}
    />
  )
}

/** A dish photo, or a utensils tile when it has none. */
export function DishImage({ src, name, className }: NamedImageProps) {
  return (
    <RemoteImage
      src={src}
      alt={name}
      className={cn("size-full", className)}
      fallback={<DefaultDish />}
    />
  )
}
