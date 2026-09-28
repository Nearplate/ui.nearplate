"use client"

import { useMapsLibrary } from "@vis.gl/react-google-maps"
import { useEffect, useRef, useState } from "react"

import { Input } from "@/components/ui/input"

const DEBOUNCE_MS = 250
const RESULT_REGION_CODES = ["in"]

interface PlaceSearchProps {
  id?: string
  name?: string
  required?: boolean
  value: string
  onValueChange: (value: string) => void
  onSelect: (place: google.maps.places.Place) => void
}

/** A text input backed by the new Places Autocomplete API, with a suggestion dropdown. */
export function PlaceSearch({
  id,
  name,
  required,
  value,
  onValueChange,
  onSelect,
}: PlaceSearchProps) {
  const placesLibrary = useMapsLibrary("places")
  const [suggestions, setSuggestions] = useState<
    google.maps.places.AutocompleteSuggestion[]
  >([])
  const [activeIndex, setActiveIndex] = useState(-1)
  const sessionTokenRef =
    useRef<google.maps.places.AutocompleteSessionToken>(undefined)

  const searchable = placesLibrary !== null && value.trim().length >= 3

  useEffect(() => {
    if (!placesLibrary || !searchable) return

    const timer = setTimeout(() => {
      sessionTokenRef.current ??= new placesLibrary.AutocompleteSessionToken()

      void placesLibrary.AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input: value,
        includedRegionCodes: RESULT_REGION_CODES,
        sessionToken: sessionTokenRef.current,
      }).then(({ suggestions: results }) => {
        setSuggestions(results)
        setActiveIndex(-1)
      })
    }, DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [placesLibrary, value, searchable])

  async function choose(suggestion: google.maps.places.AutocompleteSuggestion) {
    const prediction = suggestion.placePrediction
    if (!prediction) return

    const place = prediction.toPlace()
    await place.fetchFields({
      fields: ["location", "addressComponents", "formattedAddress"],
    })

    sessionTokenRef.current = undefined
    onValueChange(place.formattedAddress ?? prediction.text.text)
    setSuggestions([])
    onSelect(place)
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (suggestions.length === 0) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault()
      void choose(suggestions[activeIndex])
    } else if (e.key === "Escape") {
      setSuggestions([])
    }
  }

  return (
    <div className="relative w-full">
      <Input
        id={id}
        name={name}
        required={required}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        onKeyDown={onKeyDown}
        autoComplete="off"
      />
      {searchable && suggestions.length > 0 ? (
        <ul className="absolute top-full right-0 left-0 z-10 mt-1 max-h-64 overflow-auto border-2 border-inverted bg-default">
          {suggestions.map((suggestion, index) => {
            const prediction = suggestion.placePrediction
            if (!prediction) return null
            return (
              <li key={prediction.placeId}>
                <button
                  type="button"
                  className={
                    index === activeIndex
                      ? "block w-full bg-elevated px-3 py-2 text-left text-sm"
                      : "block w-full px-3 py-2 text-left text-sm hover:bg-elevated"
                  }
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => void choose(suggestion)}
                >
                  {prediction.text.text}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
