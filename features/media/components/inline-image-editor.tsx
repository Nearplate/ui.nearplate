"use client"

import { ImageUpIcon, PencilIcon } from "lucide-react"
import { useRef, useState } from "react"

import {
  RestaurantBanner,
  RestaurantLogo,
} from "@/features/restaurant/components/remote-image"
import { cn } from "@/lib/utils"

import { IMAGE_ACCEPT } from "../constants"
import { useImageUpload } from "../use-image-upload"

interface InlineImageEditorProps {
  restaurantId: string
  kind: "logo" | "banner"
  name: string
  currentUrl: string | null
  className?: string
}

/**
 * The restaurant's logo or banner with an upload control on top: a pencil
 * revealed on hover for the logo, a "Change" button in the top-right corner
 * for the banner. Errors show as a small caption over the image.
 */
export function InlineImageEditor({
  restaurantId,
  kind,
  name,
  currentUrl,
  className,
}: InlineImageEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [url, setUrl] = useState(currentUrl)
  const { status, error, previewUrl, upload } = useImageUpload(
    { restaurantId, kind },
    { onUploaded: setUrl }
  )
  const isUploading = status === "uploading"
  const src = previewUrl ?? url
  const label = url ? "Change" : "Add"

  return (
    <div
      className={cn(
        "group relative overflow-hidden",
        isUploading && "opacity-60",
        className
      )}
    >
      {kind === "logo" ? (
        <RestaurantLogo src={src} name={name} className="text-2xl" />
      ) : (
        <RestaurantBanner src={src} name={name} />
      )}

      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        className="sr-only"
        tabIndex={-1}
        aria-label={`Choose ${kind} image`}
        onChange={(event) => {
          const file = event.target.files?.[0]
          event.target.value = ""
          if (file) void upload(file)
        }}
      />

      {kind === "logo" ? (
        <button
          type="button"
          disabled={isUploading}
          aria-label={`${label} logo`}
          onClick={() => inputRef.current?.click()}
          className="bg-inverted/60 absolute inset-0 flex cursor-pointer items-center justify-center text-inverted opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-highlight disabled:cursor-not-allowed"
        >
          <span className="flex size-9 items-center justify-center border-2 border-inverted bg-highlight text-neutral-950">
            <PencilIcon aria-hidden className="size-4" />
          </span>
        </button>
      ) : (
        <button
          type="button"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
          className="absolute top-2 right-2 inline-flex cursor-pointer items-center gap-1.5 border-2 border-inverted bg-default px-2.5 py-1 font-mono text-[11px] font-medium tracking-wider uppercase hover:bg-highlight focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed"
        >
          <ImageUpIcon aria-hidden className="size-3.5" />
          {isUploading ? "Uploading…" : `${label} banner`}
        </button>
      )}

      {error ? (
        <p
          role="alert"
          className="absolute inset-x-0 bottom-0 bg-default px-2 py-1 font-mono text-[10px] text-error"
        >
          {error}
        </p>
      ) : null}
    </div>
  )
}
