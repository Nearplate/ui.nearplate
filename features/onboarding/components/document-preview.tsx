import { FileTextIcon } from "lucide-react"

import { cn } from "@/lib/utils"

interface DocumentPreviewProps {
  contentType: string
  url: string | null
  label: string
  className?: string
}

/** A thumbnail for images, a file icon for PDFs. The URL is a short-lived presigned GET. */
export function DocumentPreview({
  contentType,
  url,
  label,
  className,
}: DocumentPreviewProps) {
  const isImage = contentType.startsWith("image/") && url
  return (
    <div
      className={cn(
        "flex size-16 shrink-0 items-center justify-center overflow-hidden border-2 border-inverted bg-elevated",
        className
      )}
    >
      {isImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- presigned S3 URL, expires in minutes
        <img
          src={url}
          alt={label}
          loading="lazy"
          decoding="async"
          className="size-full object-cover"
        />
      ) : (
        <FileTextIcon aria-hidden className="size-6 text-muted" />
      )}
    </div>
  )
}
