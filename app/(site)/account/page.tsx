import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { BackLink } from "@/components/layout/back-link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardBody, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { listAddresses } from "@/features/account/api/address-api"
import { listMyOrders } from "@/features/account/api/order-api"
import { AccountTabs } from "@/features/account/components/account-tabs"
import { AddressBook } from "@/features/account/components/address-book"
import { DefaultAddressCard } from "@/features/account/components/default-address-card"
import { OrderList } from "@/features/account/components/order-list"
import { Pagination } from "@/features/account/components/pagination"
import { PaymentMethods } from "@/features/account/components/payment-methods"
import { ProfileForm } from "@/features/account/components/profile-form"
import { pageCount } from "@/features/account/schemas"
import { logoutAction } from "@/features/auth/actions"
import { getAccessToken, getSession } from "@/features/auth/session"

export const metadata: Metadata = { title: "Account" }

interface AccountPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const user = await getSession()
  if (!user) redirect("/auth")
  if (user.role === "restaurant") redirect("/restaurant")
  if (!user.isOnboarded) redirect("/onboarding")

  const params = await searchParams
  const page = Math.max(1, Number(params.page) || 1)

  const accessToken = await getAccessToken()
  const [addresses, orderPage] = accessToken
    ? await Promise.all([
        listAddresses(accessToken),
        listMyOrders(accessToken, page),
      ])
    : [[], { items: [], total: 0 }]

  const defaultAddress = addresses.find((a) => a.isDefault) ?? null

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-3 p-4 md:p-6">
      <BackLink href="/">Home</BackLink>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl uppercase">Your account</h1>
        <form action={logoutAction}>
          <Button type="submit" variant="outline" color="neutral" size="sm">
            Log out
          </Button>
        </form>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <span className="font-mono text-sm break-all">{user.email}</span>
          <Badge variant="soft" color="neutral">
            {user.role}
          </Badge>
        </CardHeader>
        <Separator />
        <CardBody>
          <ProfileForm user={user} />
        </CardBody>
      </Card>

      <DefaultAddressCard address={defaultAddress} />

      <Card>
        <CardBody>
          <AccountTabs
            orders={
              <div className="flex flex-col gap-3">
                <OrderList orders={orderPage.items} />
                <Pagination
                  page={page}
                  totalPages={pageCount(orderPage.total)}
                />
              </div>
            }
            addresses={<AddressBook addresses={addresses} />}
            payments={<PaymentMethods />}
          />
        </CardBody>
      </Card>
    </section>
  )
}
