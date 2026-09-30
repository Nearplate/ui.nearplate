import { LocationDialog } from "./location-dialog"

interface LocationBarProps {
  /** Null when no location is known yet. */
  label: string | null
  openCount: number | null
}

/** "Near {label} · N open now" strip with the change-location control. */
export function LocationBar({ label, openCount }: LocationBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b-2 border-inverted bg-elevated px-4 py-1.5">
      <p className="min-w-0 truncate font-mono text-[11px] tracking-wider uppercase">
        <span className="text-muted">Near </span>
        <span className="font-medium text-highlighted">
          {label ?? "Choose a location"}
        </span>
      </p>
      {openCount !== null ? (
        <span className="bg-highlight px-1.5 py-0.5 font-mono text-[10px] font-medium tracking-wider text-neutral-950 uppercase">
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
