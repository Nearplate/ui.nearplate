"use client"

import dynamic from "next/dynamic"
import { useState } from "react"

import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { Address } from "../schemas"

const LocationPicker = dynamic(
  () => import("./location-picker").then((mod) => mod.LocationPicker),
  {
    ssr: false,
    loading: () => <div className="h-64 animate-pulse bg-elevated" />,
  }
)

interface LocationFieldsProps {
  initialLat: number | null
  initialLng: number | null
  initialAddress?: Partial<Address>
  required: boolean
}

/** Map picker + hidden coordinate inputs + the address fields, as one unit. */
export function LocationFields({
  initialLat,
  initialLng,
  initialAddress,
  required,
}: LocationFieldsProps) {
  const [coords, setCoords] = useState<[number, number] | null>(
    initialLat !== null && initialLng !== null ? [initialLat, initialLng] : null
  )

  return (
    <div className="flex flex-col gap-3">
      <LocationPicker
        initialLat={initialLat}
        initialLng={initialLng}
        onChange={(lat, lng) => setCoords([lat, lng])}
      />
      <input type="hidden" name="lat" value={coords ? coords[0] : ""} />
      <input type="hidden" name="lng" value={coords ? coords[1] : ""} />

      <Field label="Address line 1" htmlFor="line1">
        <Input
          id="line1"
          name="line1"
          defaultValue={initialAddress?.line1}
          required={required}
        />
      </Field>
      <Field label="Address line 2 (optional)" htmlFor="line2">
        <Input
          id="line2"
          name="line2"
          defaultValue={initialAddress?.line2 ?? ""}
        />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="City" htmlFor="city">
          <Input
            id="city"
            name="city"
            defaultValue={initialAddress?.city}
            required={required}
          />
        </Field>
        <Field label="State" htmlFor="state">
          <Input
            id="state"
            name="state"
            defaultValue={initialAddress?.state}
            required={required}
          />
        </Field>
        <Field label="Zip code" htmlFor="zipcode">
          <Input
            id="zipcode"
            name="zipcode"
            defaultValue={initialAddress?.zipcode}
            required={required}
          />
        </Field>
        <Field label="Phone" htmlFor="phoneNumber">
          <Input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            defaultValue={initialAddress?.phoneNumber ?? ""}
            required={required}
          />
        </Field>
      </div>
    </div>
  )
}
