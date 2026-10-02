"use client"

import { ImageUpIcon, Trash2Icon } from "lucide-react"
import { useRef, useState, useTransition } from "react"

import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  DishImage,
  RestaurantBanner,
  RestaurantLogo,
} from "@/features/restaurant/components/remote-image"
import { cn } from "@/lib/utils"

import { removeImageAction } from "../actions"
import { IMAGE_ACCEPT, MAX_UPLOAD_BYTES } from "../constants"
import type { ImageTarget } from "../schemas"
import { useImageUpload } from "../use-image-upload"

const BYTES_PER_MB = 1024 * 1024

const FRAME_CLASS = {
  logo: "size-24",
  banner: "aspect-[2/1] w-full max-w-md",
  menu_item: "size-24",
} as const

/** Square slots get an action button as wide as the frame above it. */
const BUTTON_WIDTH_CLASS = {
  logo: "w-24",
  banner: "",
  menu_item: "w-24",
} as const

interface ImageDropzoneProps {
  target: ImageTarget
  /** Restaurant or dish name, used for alt text and the default image. */
  name: string
  currentUrl: string | null
  className?: string
}

function SlotImage({
  kind,
  src,
  name,
}: {
  kind: ImageTarget["kind"]
  src: string | null
  name: string
}) {
  if (kind === "logo") return <RestaurantLogo src={src} name={name} />
  if (kind === "banner") return <RestaurantBanner src={src} name={name} />
  return <DishImage src={src} name={name} />
}

/** Click or drop an image to upload it straight to S3; Remove restores the default. */
export function ImageDropzone({
  target,
  name,
  currentUrl,
  className,
}: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [url, setUrl] = useState(currentUrl)
  const [removeError, setRemoveError] = useState<string | null>(null)
  const [isRemoving, startRemove] = useTransition()
  const [isDragging, setIsDragging] = useState(false)
  const { status, error, previewUrl, upload, reset } = useImageUpload(target, {
    onUploaded: setUrl,
  })
  const isUploading = status === "uploading"
  const maxMb = MAX_UPLOAD_BYTES[target.kind] / BYTES_PER_MB

  function pick(file: File | undefined) {
    if (!file) return
    setRemoveError(null)
    void upload(file)
  }

  function remove() {
    setRemoveError(null)
    startRemove(async () => {
      const result = await removeImageAction(target)
      if (!result.ok) return setRemoveError(result.message)
      reset()
      setUrl(null)
    })
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setIsDragging(false)
          pick(event.dataTransfer.files[0])
        }}
        className={cn(
          "relative overflow-hidden border-2 border-inverted bg-elevated",
          FRAME_CLASS[target.kind],
          isDragging && "bg-highlight",
          isUploading && "opacity-60"
        )}
      >
        <SlotImage kind={target.kind} src={previewUrl ?? url} name={name} />
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        className="sr-only"
        aria-label={`Choose ${target.kind.replace("_", " ")} image`}
        onChange={(event) => {
          pick(event.target.files?.[0])
          event.target.value = ""
        }}
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          color="neutral"
          className={BUTTON_WIDTH_CLASS[target.kind]}
          loading={isUploading}
          onClick={() => inputRef.current?.click()}
        >
          <ImageUpIcon aria-hidden />
          {url ? "Replace" : "Upload"}
        </Button>
        {url ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            color="error"
            loading={isRemoving}
            disabled={isUploading}
            onClick={remove}
          >
            <Trash2Icon aria-hidden />
            Remove
          </Button>
        ) : null}
        <span className="font-mono text-[10px] tracking-wider text-muted uppercase">
          JPG, PNG, WebP · max {maxMb} MB
        </span>
      </div>
      {error || removeError ? (
        <Alert tone="error">{error ?? removeError}</Alert>
      ) : null}
    </div>
  )
}
