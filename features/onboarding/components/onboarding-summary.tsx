import Link from "next/link"

import { Card, CardBody, CardHeader } from "@/components/ui/card"
import type { OwnerRestaurant } from "@/features/restaurant/schemas"

import {
  BANK_DOCUMENTS,
  DOCUMENT_LABELS,
  IDENTITY_DOCUMENTS,
  KYC_FIELD_LABELS,
  stepHref,
  type DocumentType,
  type KycField,
  type OnboardingStep,
} from "../constants"
import type { Kyc, RestaurantDocument } from "../schemas"
import { DocumentPreview } from "./document-preview"

interface OnboardingSummaryProps {
  restaurant: OwnerRestaurant
  kyc: Kyc
  documents: readonly RestaurantDocument[]
  /** Shows an Edit link per section (wizard review); off for the status page. */
  editable: boolean
}

const NOT_PROVIDED = "Not provided"

const IDENTITY_FIELDS: readonly KycField[] = ["panNumber", "fssaiNumber"]
const BANK_FIELDS: readonly KycField[] = [
  "accountHolderName",
  "accountNumber",
  "ifscCode",
  "bankName",
]

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
      <dt className="font-mono text-[10px] tracking-wider text-muted uppercase sm:w-44 sm:shrink-0">
        {label}
      </dt>
      <dd className="min-w-0 text-sm break-words">{value}</dd>
    </div>
  )
}

function Section({
  title,
  editStep,
  children,
}: {
  title: string
  editStep?: OnboardingStep
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader className="flex items-center justify-between gap-2 border-b-2 border-default">
        <h2 className="font-display text-lg uppercase">{title}</h2>
        {editStep ? (
          <Link
            href={stepHref(editStep)}
            aria-label={`Edit ${title}`}
            className="font-mono text-xs underline"
          >
            Edit
          </Link>
        ) : null}
      </CardHeader>
      <CardBody className="flex flex-col gap-3">{children}</CardBody>
    </Card>
  )
}

function KycRows({ kyc, fields }: { kyc: Kyc; fields: readonly KycField[] }) {
  return (
    <dl className="flex flex-col gap-2">
      {fields.map((field) => (
        <Row
          key={field}
          label={KYC_FIELD_LABELS[field]}
          value={kyc[field] ?? NOT_PROVIDED}
        />
      ))}
    </dl>
  )
}

function DocumentGrid({
  types,
  documents,
}: {
  types: readonly DocumentType[]
  documents: readonly RestaurantDocument[]
}) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {types.map((type) => {
        const doc = documents.find(
          (d) => d.type === type && d.status === "uploaded"
        )
        return (
          <li key={type} className="flex items-center gap-3">
            <DocumentPreview
              contentType={doc?.contentType ?? ""}
              url={doc?.url ?? null}
              label={DOCUMENT_LABELS[type]}
            />
            <div className="flex min-w-0 flex-col gap-1">
              <span className="font-mono text-xs tracking-wider uppercase">
                {DOCUMENT_LABELS[type]}
              </span>
              {doc?.url ? (
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`View ${DOCUMENT_LABELS[type]}`}
                  className="font-mono text-xs underline"
                >
                  View
                </a>
              ) : (
                <span className="font-mono text-xs text-muted">
                  {NOT_PROVIDED}
                </span>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

/** Read-only recap of everything submitted, shared by the review step and status page. */
export function OnboardingSummary({
  restaurant,
  kyc,
  documents,
  editable,
}: OnboardingSummaryProps) {
  const { address } = restaurant
  return (
    <div className="flex flex-col gap-4">
      <Section title="Restaurant" editStep={editable ? "details" : undefined}>
        <dl className="flex flex-col gap-2">
          <Row label="Name" value={restaurant.name} />
          <Row label="Cuisines" value={restaurant.cuisines.join(", ")} />
          <Row label="Pure veg" value={restaurant.isPureVeg ? "Yes" : "No"} />
          <Row
            label="Address"
            value={[
              address.line1,
              address.line2,
              address.city,
              address.state,
              address.zipcode,
            ]
              .filter(Boolean)
              .join(", ")}
          />
          <Row label="Phone" value={address.phoneNumber ?? NOT_PROVIDED} />
        </dl>
      </Section>

      <Section title="Identity" editStep={editable ? "identity" : undefined}>
        <KycRows kyc={kyc} fields={IDENTITY_FIELDS} />
        <DocumentGrid types={IDENTITY_DOCUMENTS} documents={documents} />
      </Section>

      <Section title="Bank" editStep={editable ? "bank" : undefined}>
        <KycRows kyc={kyc} fields={BANK_FIELDS} />
        <DocumentGrid types={BANK_DOCUMENTS} documents={documents} />
      </Section>
    </div>
  )
}
