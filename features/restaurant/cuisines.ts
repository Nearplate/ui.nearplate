const MAX_CUISINES = 10

/** Comma-separated free text -> a lowercase, deduped, capped cuisine list. */
export function parseCuisines(input: string): string[] {
  const seen = new Set<string>()
  for (const raw of input.split(",")) {
    const cuisine = raw.trim().toLowerCase()
    if (cuisine && !seen.has(cuisine)) {
      seen.add(cuisine)
    }
    if (seen.size >= MAX_CUISINES) break
  }
  return Array.from(seen)
}
