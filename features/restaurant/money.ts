const PAISE_PER_RUPEE = 100
const RUPEES_REGEX = /^\d+(\.\d{1,2})?$/

/** `"249.50"` -> `24950`. Throws on more than two decimals or a negative. */
export function rupeesToPaise(rupees: string): number {
  const trimmed = rupees.trim()
  if (!RUPEES_REGEX.test(trimmed)) {
    throw new Error("Enter a valid amount, e.g. 249.50")
  }
  const [whole, fraction = ""] = trimmed.split(".")
  const paise = fraction.padEnd(2, "0")
  return Number(whole) * PAISE_PER_RUPEE + Number(paise)
}

/** `24950` -> `"₹249.50"`. */
export function formatPaise(paise: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(paise / PAISE_PER_RUPEE)
}
