import type { Metadata } from "next"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { buttonTheme } from "@/components/ui/button"
import { Card, CardBody, CardHeader } from "@/components/ui/card"
import { getMyOrder } from "@/features/account/api/order-api"
import { STATUS_COLOR } from "@/features/account/components/order-list"
import {
  ORDER_STATUS_LABELS,
  type OrderDetail,
} from "@/features/account/schemas"
import { getAccessToken, getSession } from "@/features/auth/session"
import { formatPaise } from "@/features/restaurant/money"
import { ApiError } from "@/lib/api/client"

export const metadata: Metadata = { title: "Order" }

const HTTP_NOT_FOUND = 404
const SHORT_ID_LENGTH = 8

interface OrderPageProps {
  params: Promise<{ id: string }>
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { id } = await params

  const user = await getSession()
  if (!user) redirect("/auth")
  if (user.role === "restaurant") redirect("/restaurant")

  const accessToken = await getAccessToken()
  if (!accessToken) redirect("/auth")

  let order: OrderDetail
  try {
    order = await getMyOrder(accessToken, id)
  } catch (error) {
    if (error instanceof ApiError && error.status === HTTP_NOT_FOUND) {
      notFound()
    }
    throw error
  }

  const { deliveryAddress: address } = order

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-3 p-4 md:p-6">
      <h1 className="font-display text-4xl uppercase">Order placed</h1>

      <Card>
        <CardHeader className="flex items-center justify-between gap-2 border-b-2 border-default">
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-sm uppercase">
              Order #{order.id.slice(0, SHORT_ID_LENGTH)}
            </span>
            <span className="font-mono text-[11px] text-muted">
              {new Date(order.createdAt).toLocaleString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
          </div>
          <Badge color={STATUS_COLOR[order.status]} variant="soft">
            {ORDER_STATUS_LABELS[order.status]}
          </Badge>
        </CardHeader>
        <CardBody className="flex flex-col gap-3">
          <ul className="flex flex-col">
            {order.items.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 border-b-2 border-muted py-2 last:border-b-0"
              >
                <span className="min-w-0 flex-1 truncate font-medium">
                  {item.nameSnapshot}
                </span>
                <span className="font-mono text-xs">×{item.quantity}</span>
                <span className="w-20 shrink-0 text-right font-mono text-sm">
                  {formatPaise(item.priceInPaiseSnapshot * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between border-t-2 border-dashed border-default pt-3 font-mono text-sm">
            <span className="tracking-wider uppercase">Total</span>
            <span>{formatPaise(order.totalInPaise)}</span>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="border-b-2 border-default font-mono text-sm tracking-wider uppercase">
          Delivering to{address.label ? ` (${address.label})` : ""}
        </CardHeader>
        <CardBody className="flex flex-col gap-0.5 text-sm">
          <span>
            {[address.line1, address.line2].filter(Boolean).join(", ")}
          </span>
          <span className="text-muted">
            {address.city}, {address.state} {address.zipcode}
          </span>
          {address.phoneNumber ? (
            <span className="font-mono text-xs text-muted">
              {address.phoneNumber}
            </span>
          ) : null}
        </CardBody>
      </Card>

      <div className="flex justify-end">
        <Link
          href="/"
          className={buttonTheme({ variant: "outline", color: "neutral" })}
        >
          Order More
        </Link>
      </div>
    </section>
  )
}
