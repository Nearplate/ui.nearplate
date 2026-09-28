"use client"

import {
  AdvancedMarker,
  Map,
  MapControl,
  ControlPosition,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps"
import { LocateFixed } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  fromGeocoderComponents,
  toAddress,
  type PartialAddress,
} from "../google-address"

const GOOGLE_MAPS_MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID

/** Central India: a sane default before the owner places their pin. */
const DEFAULT_CENTER = { lat: 22.5, lng: 79 }
const DEFAULT_ZOOM = 5
const PLACED_ZOOM = 17

interface LocationPickerProps {
  pin: PinPosition | null
  onLocationChange: (lat: number, lng: number) => void
  onAddressResolved: (address: PartialAddress) => void
}

interface PinPosition {
  lat: number
  lng: number
}

function LocationPin({
  lat,
  lng,
  draggable,
  onDragEnd,
}: PinPosition & {
  draggable: boolean
  onDragEnd: (lat: number, lng: number) => void
}) {
  return (
    <AdvancedMarker
      position={{ lat, lng }}
      draggable={draggable}
      onDragEnd={(e) => {
        const latLng = e.latLng
        if (latLng) onDragEnd(latLng.lat(), latLng.lng())
      }}
    >
      <span className="block size-[18px] border-[3px] border-highlight bg-neutral-950" />
    </AdvancedMarker>
  )
}

function UseMyLocationControl({
  onLocate,
}: {
  onLocate: (lat: number, lng: number) => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function locate() {
    setLoading(true)
    setError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoading(false)
        onLocate(pos.coords.latitude, pos.coords.longitude)
      },
      () => {
        setLoading(false)
        setError("Couldn't get your location. Check location permissions.")
      }
    )
  }

  return (
    <div className="flex flex-col items-end gap-1 p-2">
      <Button
        type="button"
        variant="outline"
        color="neutral"
        size="sm"
        loading={loading}
        onClick={locate}
        className="bg-default"
      >
        <LocateFixed className="size-4" />
        Use my location
      </Button>
      {error ? (
        <Alert tone="error" className="max-w-52">
          {error}
        </Alert>
      ) : null}
    </div>
  )
}

function MapContents({
  pin,
  onPlace,
  onAddressResolved,
}: {
  pin: PinPosition | null
  onPlace: (lat: number, lng: number) => void
  onAddressResolved: (address: PartialAddress) => void
}) {
  const map = useMap()
  const geocodingLibrary = useMapsLibrary("geocoding")
  const geocoder = useMemo(
    () => (geocodingLibrary ? new geocodingLibrary.Geocoder() : null),
    [geocodingLibrary]
  )

  useEffect(() => {
    if (!pin || !map) return
    map.panTo(pin)
    map.setZoom(Math.max(map.getZoom() ?? DEFAULT_ZOOM, PLACED_ZOOM))
  }, [pin, map])

  function reverseGeocode(lat: number, lng: number) {
    geocoder?.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results?.[0]) {
        onAddressResolved(
          toAddress(fromGeocoderComponents(results[0].address_components))
        )
      }
    })
  }

  function place(lat: number, lng: number, reverseGeo: boolean) {
    onPlace(lat, lng)
    if (reverseGeo) reverseGeocode(lat, lng)
  }

  return (
    <>
      <Map
        mapId={GOOGLE_MAPS_MAP_ID}
        defaultCenter={pin ?? DEFAULT_CENTER}
        defaultZoom={pin ? PLACED_ZOOM : DEFAULT_ZOOM}
        gestureHandling="cooperative"
        clickableIcons={false}
        disableDefaultUI
        zoomControl
        fullscreenControl
        className="size-full"
        onClick={(e) => {
          const latLng = e.detail.latLng
          if (latLng) place(latLng.lat, latLng.lng, true)
        }}
      >
        {pin ? (
          <LocationPin
            lat={pin.lat}
            lng={pin.lng}
            draggable
            onDragEnd={(lat, lng) => place(lat, lng, true)}
          />
        ) : null}
      </Map>
      <MapControl position={ControlPosition.TOP_LEFT}>
        <UseMyLocationControl onLocate={(lat, lng) => place(lat, lng, true)} />
      </MapControl>
    </>
  )
}

/**
 * A Google Map with click-to-place and a draggable pin. Reports the chosen
 * coordinates and, where available, the resolved address so the caller can
 * mirror both into the form. The pin is controlled by the caller so it can
 * also be moved by selecting an address elsewhere in the form.
 */
export function LocationPicker({
  pin,
  onLocationChange,
  onAddressResolved,
}: LocationPickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="relative h-80 border-2 border-inverted">
        <MapContents
          pin={pin}
          onPlace={onLocationChange}
          onAddressResolved={onAddressResolved}
        />
      </div>
      <p className="text-xs text-muted">
        Search for an address below, or click the map, or drag the pin.
      </p>
    </div>
  )
}
