"use client"

import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { useRef, useState } from "react"
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet"

import { Button } from "@/components/ui/button"

/** Central India: a sane default before the owner places their pin. */
const DEFAULT_LAT = 22.5
const DEFAULT_LNG = 79
const DEFAULT_ZOOM = 5
const PLACED_ZOOM = 15

const PIN_ICON = L.divIcon({
  className: "",
  html: '<span style="display:block;width:18px;height:18px;background:#000;border:3px solid #d4f53c;"></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

interface LocationPickerProps {
  initialLat: number | null
  initialLng: number | null
  onChange: (lat: number, lng: number) => void
}

function ClickToPlace({
  onPlace,
}: {
  onPlace: (lat: number, lng: number) => void
}) {
  useMapEvents({
    click(e) {
      onPlace(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

/**
 * A draggable pin on an OSM map. Manages its own position after the initial
 * value, calling `onChange` on every move so the caller can mirror it into
 * hidden form fields.
 */
export function LocationPicker({
  initialLat,
  initialLng,
  onChange,
}: LocationPickerProps) {
  const [position, setPosition] = useState<[number, number]>([
    initialLat ?? DEFAULT_LAT,
    initialLng ?? DEFAULT_LNG,
  ])
  const [placed, setPlaced] = useState(
    initialLat !== null && initialLng !== null
  )
  const mapRef = useRef<L.Map | null>(null)

  function place(lat: number, lng: number) {
    setPosition([lat, lng])
    setPlaced(true)
    onChange(lat, lng)
    mapRef.current?.setView(
      [lat, lng],
      Math.max(mapRef.current.getZoom(), PLACED_ZOOM)
    )
  }

  function useMyLocation() {
    navigator.geolocation.getCurrentPosition((pos) => {
      place(pos.coords.latitude, pos.coords.longitude)
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="h-64 border-2 border-inverted">
        <MapContainer
          ref={mapRef}
          center={position}
          zoom={placed ? PLACED_ZOOM : DEFAULT_ZOOM}
          className="size-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickToPlace onPlace={place} />
          {placed ? (
            <Marker
              position={position}
              icon={PIN_ICON}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const marker = e.target as L.Marker
                  const { lat, lng } = marker.getLatLng()
                  place(lat, lng)
                },
              }}
            />
          ) : null}
        </MapContainer>
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          color="neutral"
          size="sm"
          onClick={useMyLocation}
        >
          Use my location
        </Button>
        <p className="text-xs text-muted">Or click the map, or drag the pin.</p>
      </div>
    </div>
  )
}
