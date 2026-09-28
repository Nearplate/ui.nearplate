import { Badge } from "@/components/ui/badge"

/** Placeholder until online payments ship. */
export function PaymentMethods() {
  return (
    <div className="flex items-center justify-between py-6">
      <p className="text-sm text-muted">Payment methods</p>
      <Badge color="neutral" variant="soft">
        Coming soon
      </Badge>
    </div>
  )
}
