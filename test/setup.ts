import "@testing-library/jest-dom/vitest"

import { cleanup } from "@testing-library/react"
import { afterEach } from "vitest"

// Components branch on this at module load, so components that render a map
// (even ones that mock away the actual Map/Places calls) need a non-empty
// value here to reach their normal render path in tests.
process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||= "test-google-maps-api-key"

// Vitest globals are off, so Testing Library cannot register cleanup itself.
afterEach(() => {
  cleanup()
})
