import { MapPinIcon } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Card, CardBody } from "@/components/ui/card"

import type { AccountAddress } from "../schemas"

interface DefaultAddressCardProps {
  address: AccountAddress | null
}

/** One-line strip showing the caller's default address, or a prompt to add one. */
export function DefaultAddressCard({ address }: DefaultAddressCardProps) {
  return (
    <Card>
      <CardBody className="flex items-center gap-3 py-3">
        <span className="grid size-8 shrink-0 place-items-center bg-inverted text-highlight">
          <MapPinIcon aria-hidden className="size-4" />
        </span>
        {address ? (
          <>
            <Badge color="neutral" variant="soft" className="shrink-0">
              {address.label ?? "Address"}
            </Badge>
            <span className="min-w-0 flex-1 truncate text-sm">
              {address.line1}, {address.city}, {address.state} {address.zipcode}
            </span>
          </>
        ) : (
          <span className="flex-1 text-sm text-muted">No default address</span>
        )}
        <Link
          href="?tab=addresses"
          scroll={false}
          className="shrink-0 font-mono text-xs tracking-wider text-highlighted uppercase underline"
        >
          {address ? "Change" : "Add address"}
        </Link>
      </CardBody>
    </Card>
  )
}
