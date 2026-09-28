"use client"

import { APIProvider } from "@vis.gl/react-google-maps"
import dynamic from "next/dynamic"
import type { ChangeEvent } from "react"
import { useState } from "react"

import { Alert } from "@/components/ui/alert"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { fromPlacesComponents, toAddress } from "../google-address"
import type { Address } from "../schemas"
import { PlaceSearch } from "./place-search"

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

const LocationPicker = dynamic(
  () => import("./location-picker").then((mod) => mod.LocationPicker),
  {
    ssr: false,
    loading: () => <div className="h-80 animate-pulse bg-elevated" />,
  }
)

interface LocationFieldsProps {
  initialLat: number | null
  initialLng: number | null
  initialAddress?: Partial<Address>
  required: boolean
}

interface AddressDraft {
  line1: string
  line2: string
  city: string
  state: string
  zipcode: string
  phoneNumber: string
}

function draftFrom(initialAddress?: Partial<Address>): AddressDraft {
  return {
    line1: initialAddress?.line1 ?? "",
    line2: initialAddress?.line2 ?? "",
    city: initialAddress?.city ?? "",
    state: initialAddress?.state ?? "",
    zipcode: initialAddress?.zipcode ?? "",
    phoneNumber: initialAddress?.phoneNumber ?? "",
  }
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
  const [address, setAddress] = useState<AddressDraft>(() =>
    draftFrom(initialAddress)
  )

  function field(name: keyof AddressDraft) {
    return {
      value: address[name],
      onChange: (e: ChangeEvent<HTMLInputElement>) =>
        setAddress((prev) => ({ ...prev, [name]: e.target.value })),
    }
  }

  const fields = (
    <>
      <input type="hidden" name="lat" value={coords ? coords[0] : ""} />
      <input type="hidden" name="lng" value={coords ? coords[1] : ""} />

      <Field label="Address line 1" htmlFor="line1">
        {GOOGLE_MAPS_API_KEY ? (
          <PlaceSearch
            id="line1"
            name="line1"
            required={required}
            value={address.line1}
            onValueChange={(value) =>
              setAddress((prev) => ({ ...prev, line1: value }))
            }
            onSelect={(place) => {
              const location = place.location
              if (location) setCoords([location.lat(), location.lng()])
              // line1 is set from the full formatted address in `onValueChange`.
              const { city, state, zipcode } = toAddress(
                fromPlacesComponents(place.addressComponents ?? [])
              )
              setAddress((prev) => ({
                ...prev,
                city: city ?? prev.city,
                state: state ?? prev.state,
                zipcode: zipcode ?? prev.zipcode,
              }))
            }}
          />
        ) : (
          <Input
            id="line1"
            name="line1"
            required={required}
            {...field("line1")}
          />
        )}
      </Field>
      <Field label="Address line 2 (optional)" htmlFor="line2">
        <Input id="line2" name="line2" {...field("line2")} />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="City" htmlFor="city">
          <Input id="city" name="city" required={required} {...field("city")} />
        </Field>
        <Field label="State" htmlFor="state">
          <Input
            id="state"
            name="state"
            required={required}
            {...field("state")}
          />
        </Field>
        <Field label="Zip code" htmlFor="zipcode">
          <Input
            id="zipcode"
            name="zipcode"
            required={required}
            {...field("zipcode")}
          />
        </Field>
        <Field label="Phone" htmlFor="phoneNumber">
          <div className="relative">
            <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-sm text-muted">
              +91
            </span>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              inputMode="numeric"
              required={required}
              className="pl-10"
              {...field("phoneNumber")}
            />
          </div>
        </Field>
      </div>
    </>
  )

  return (
    <div className="flex flex-col gap-3">
      {GOOGLE_MAPS_API_KEY ? (
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
          <LocationPicker
            pin={coords ? { lat: coords[0], lng: coords[1] } : null}
            onLocationChange={(lat, lng) => setCoords([lat, lng])}
            onAddressResolved={(resolved) =>
              setAddress((prev) => ({ ...prev, ...resolved }))
            }
          />
          {fields}
        </APIProvider>
      ) : (
        <>
          <Alert tone="error">
            Map unavailable: the Google Maps API key isn&apos;t configured.
          </Alert>
          {fields}
        </>
      )}
    </div>
  )
}
