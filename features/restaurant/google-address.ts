/** A structural subset of `google.maps.places.AddressComponent`, kept minimal so this stays testable without the Maps SDK. */
export interface AddressComponentLike {
  longText: string
  types: string[]
}

export type PartialAddress = Partial<{
  line1: string
  city: string
  state: string
  zipcode: string
}>

function textFor(
  components: AddressComponentLike[],
  type: string
): string | undefined {
  return components.find((c) => c.types.includes(type))?.longText
}

/** Adapts the classic Geocoder's `long_name` shape to `AddressComponentLike`. */
export function fromGeocoderComponents(
  components: google.maps.GeocoderAddressComponent[]
): AddressComponentLike[] {
  return components.map((c) => ({ longText: c.long_name, types: c.types }))
}

/** Adapts the new Places API's address components to `AddressComponentLike`. */
export function fromPlacesComponents(
  components: google.maps.places.AddressComponent[]
): AddressComponentLike[] {
  return components.map((c) => ({ longText: c.longText ?? "", types: c.types }))
}

/** Maps Google's address components onto our address fields. */
export function toAddress(components: AddressComponentLike[]): PartialAddress {
  const streetNumber = textFor(components, "street_number")
  const route = textFor(components, "route")
  const sublocality =
    textFor(components, "sublocality_level_2") ??
    textFor(components, "sublocality_level_1")
  const premise = textFor(components, "premise")

  const streetLine = [streetNumber, route].filter(Boolean).join(" ")
  const line1 = [premise, streetLine, sublocality]
    .filter((part): part is string => Boolean(part))
    .join(", ")

  const city =
    textFor(components, "locality") ??
    textFor(components, "administrative_area_level_3") ??
    textFor(components, "administrative_area_level_2")
  const state = textFor(components, "administrative_area_level_1")
  const zipcode = textFor(components, "postal_code")

  return {
    ...(line1 ? { line1 } : {}),
    ...(city ? { city } : {}),
    ...(state ? { state } : {}),
    ...(zipcode ? { zipcode } : {}),
  }
}
