"use client"

import { APIProvider } from "@vis.gl/react-google-maps"
import { CrosshairIcon, MapPinIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { PlaceSearch } from "@/features/restaurant/components/place-search"

import { setFeedLocationAction } from "../actions"

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
const GEOLOCATION_TIMEOUT_MS = 10_000
const CURRENT_LOCATION_LABEL = "Current location"

interface LocationDialogProps {
  /** Text of the trigger button, e.g. the current area or "Set location". */
  triggerLabel: string
  defaultOpen?: boolean
}

/** Lets the visitor centre the feed: device location or a searched place. */
export function LocationDialog({
  triggerLabel,
  defaultOpen = false,
}: LocationDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(defaultOpen)
  const [query, setQuery] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function save(lng: number, lat: number, label: string) {
    startTransition(async () => {
      const result = await setFeedLocationAction({ lng, lat, label })
      if (!result.ok) {
        setError("We couldn't use that location. Try another.")
        return
      }
      setError(null)
      setOpen(false)
      router.refresh()
    })
  }

  function useDeviceLocation() {
    if (!("geolocation" in navigator)) {
      setError("Your browser can't share its location. Search for an area.")
      return
    }
    setError(null)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        save(coords.longitude, coords.latitude, CURRENT_LOCATION_LABEL),
      () =>
        setError("Location access was denied. Search for your area instead."),
      { timeout: GEOLOCATION_TIMEOUT_MS }
    )
  }

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="outline"
        color="neutral"
        onClick={() => setOpen(true)}
      >
        <MapPinIcon aria-hidden />
        {triggerLabel}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          title="Where should we look?"
          description="See restaurants that are open near you right now."
        >
          <Button
            type="button"
            onClick={useDeviceLocation}
            disabled={isPending}
          >
            <CrosshairIcon aria-hidden />
            Use my current location
          </Button>

          {GOOGLE_MAPS_API_KEY ? (
            <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
              <div className="flex flex-col gap-1.5">
                <span className="font-mono text-[11px] tracking-wider text-muted uppercase">
                  Or search an area
                </span>
                <PlaceSearch
                  value={query}
                  onValueChange={setQuery}
                  onSelect={(place) => {
                    const point = place.location
                    if (!point) return
                    save(
                      point.lng(),
                      point.lat(),
                      place.formattedAddress ?? query
                    )
                  }}
                />
              </div>
            </APIProvider>
          ) : null}

          {error ? <Alert tone="error">{error}</Alert> : null}
        </DialogContent>
      </Dialog>
    </>
  )
}
