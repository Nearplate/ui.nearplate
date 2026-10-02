"use client"

import { ExternalLinkIcon, FileUpIcon, Trash2Icon } from "lucide-react"
import { useRef, useState } from "react"

import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

import {
  DOCUMENT_ACCEPT,
  DOCUMENT_LABELS,
  DOCUMENT_MAX_MB,
  type DocumentType,
} from "../constants"
import { useDocumentUpload, type DocumentFile } from "../use-document-upload"
import { DocumentPreview } from "./document-preview"

const BYTES_PER_KB = 1024
const KB_PER_MB = 1024

function formatSize(bytes: number): string {
  const kb = bytes / BYTES_PER_KB
  return kb >= KB_PER_MB
    ? `${(kb / KB_PER_MB).toFixed(1)} MB`
    : `${Math.max(1, Math.round(kb))} KB`
}

interface DocumentUploaderProps {
  restaurantId: string
  type: DocumentType
  initial: DocumentFile | null
  /** Read-only (e.g. under review): View only. */
  disabled?: boolean
  className?: string
}

/** One required document: pick or drop a file; uploads straight to private S3. */
export function DocumentUploader({
  restaurantId,
  type,
  initial,
  disabled = false,
  className,
}: DocumentUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [confirmingRemove, setConfirmingRemove] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const { status, progress, error, file, upload, remove } = useDocumentUpload(
    restaurantId,
    type,
    initial
  )
  const label = DOCUMENT_LABELS[type]
  const isUploading = status === "uploading"

  function pick(selected: File | undefined) {
    if (selected && !disabled) void upload(selected)
  }

  async function confirmRemove() {
    setIsRemoving(true)
    await remove()
    setIsRemoving(false)
    setConfirmingRemove(false)
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <p className="font-mono text-xs tracking-wider uppercase">{label}</p>

      {file ? (
        <div className="flex items-center gap-3 border-2 border-inverted p-2">
          <DocumentPreview
            contentType={file.contentType}
            url={file.url}
            label={label}
          />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="font-mono text-[10px] tracking-wider text-muted uppercase">
              {file.contentType.replace(/^\w+\//, "").toUpperCase()} ·{" "}
              {formatSize(file.size)}
            </span>
            {file.url ? (
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View ${label}`}
                className="inline-flex items-center gap-1 font-mono text-xs underline"
              >
                View
                <ExternalLinkIcon aria-hidden className="size-3" />
              </a>
            ) : null}
          </div>
        </div>
      ) : disabled ? (
        <p className="border-2 border-dashed border-accented p-3 font-mono text-xs text-muted">
          Not uploaded
        </p>
      ) : (
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
            "flex min-h-24 flex-col items-center justify-center gap-1 border-2 border-dashed border-inverted p-3 text-center",
            isDragging && "bg-highlight text-neutral-950"
          )}
        >
          <FileUpIcon aria-hidden className="size-5" />
          <span className="font-mono text-[10px] tracking-wider uppercase">
            Tap to choose or drop a file
          </span>
        </div>
      )}

      {isUploading ? (
        <div className="flex flex-col gap-1" aria-live="polite">
          <Progress value={progress} label={`Uploading ${label}`} size="sm" />
          <span className="font-mono text-[10px] text-muted">
            Uploading… {progress}%
          </span>
        </div>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept={DOCUMENT_ACCEPT}
        className="sr-only"
        disabled={disabled}
        aria-label={`Choose file for ${label}`}
        onChange={(event) => {
          pick(event.target.files?.[0])
          event.target.value = ""
        }}
      />

      {disabled ? null : (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            color="neutral"
            loading={isUploading}
            className="min-h-11 sm:min-h-0"
            onClick={() => inputRef.current?.click()}
          >
            <FileUpIcon aria-hidden />
            {file ? "Replace" : "Upload"}
          </Button>
          {file ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              color="error"
              disabled={isUploading}
              className="min-h-11 sm:min-h-0"
              onClick={() => setConfirmingRemove(true)}
            >
              <Trash2Icon aria-hidden />
              Remove
            </Button>
          ) : null}
          <span className="font-mono text-[10px] tracking-wider text-muted uppercase">
            PDF, JPG or PNG · max {DOCUMENT_MAX_MB} MB
          </span>
        </div>
      )}

      {error ? <Alert tone="error">{error}</Alert> : null}

      <Dialog open={confirmingRemove} onOpenChange={setConfirmingRemove}>
        <DialogContent
          title={`Remove ${label}?`}
          description="You'll need to upload it again before you can submit."
        >
          <DialogFooter>
            <DialogClose
              render={
                <Button type="button" variant="outline" color="neutral">
                  Cancel
                </Button>
              }
            />
            <Button
              type="button"
              color="error"
              loading={isRemoving}
              onClick={() => void confirmRemove()}
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
