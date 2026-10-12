import { MapPinIcon } from "lucide-react"

import { LocationDialog } from "./location-dialog"

interface LocationBarProps {
  /** Null when no location is known yet. */
  label: string | null
  openCount: number | null
}

/** "Near {label} · N open now" strip with the change-location control. */
export function LocationBar({ label, openCount }: LocationBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-default bg-elevated px-4 py-2 md:px-6">
      <p className="flex min-w-0 items-center gap-1.5 truncate font-mono text-[11px] tracking-wider uppercase">
        <MapPinIcon aria-hidden className="size-3.5 shrink-0" />
        <span className="text-muted">Near</span>
        <span className="truncate font-medium text-highlighted">
          {label ?? "Choose a location"}
        </span>
      </p>
      {openCount !== null ? (
        <span className="inline-flex items-center gap-1.5 bg-inverted px-1.5 py-0.5 font-mono text-[10px] font-medium tracking-wider text-inverted uppercase">
          <span aria-hidden className="size-1.5 rounded-full bg-highlight" />
          {openCount} open now
        </span>
      ) : null}
      <div className="ml-auto max-[359px]:ml-0">
        <LocationDialog
          triggerLabel={label ? "Change" : "Set location"}
          defaultOpen={label === null}
        />
      </div>
    </div>
  )
}
