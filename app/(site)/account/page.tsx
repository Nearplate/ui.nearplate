import { LogOutIcon } from "lucide-react"
import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { BackLink } from "@/components/layout/back-link"
import { Button } from "@/components/ui/button"
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

function initialsOf(firstName: string | null, email: string): string {
  return (firstName?.trim().charAt(0) || email.charAt(0)).toUpperCase()
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
    <>
      <section className="border-b border-default">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4 md:p-6">
          <BackLink href="/">Home</BackLink>
          <div className="flex flex-wrap items-center gap-4">
            <span
              aria-hidden
              className="grid size-16 shrink-0 place-items-center rounded-lg border border-default bg-highlight font-display text-4xl font-light tracking-tight text-highlighted shadow-soft md:size-20 md:text-5xl"
            >
              {initialsOf(user.firstName, user.email)}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <h1 className="font-display text-4xl leading-none font-light tracking-tight md:text-6xl">
                {user.firstName ? `Hi, ${user.firstName}` : "Your account"}
              </h1>
              <p className="truncate font-mono text-xs tracking-wider text-muted">
                {user.email}
              </p>
            </div>
            <form action={logoutAction}>
              <Button type="submit" variant="outline" color="neutral" size="md">
                <LogOutIcon aria-hidden />
                Log out
              </Button>
            </form>
          </div>
          <dl className="grid max-w-md grid-cols-2 rounded-lg border border-default">
            <div className="flex flex-col-reverse gap-1 p-3">
              <dt className="font-mono text-[10px] tracking-wider text-muted uppercase">
                Orders placed
              </dt>
              <dd className="font-display text-3xl leading-none tracking-tight">
                {orderPage.total}
              </dd>
            </div>
            <div className="flex flex-col-reverse gap-1 border-l border-inverted bg-inverted p-3 text-inverted">
              <dt className="font-mono text-[10px] tracking-wider uppercase opacity-80">
                Commission paid
              </dt>
              <dd className="font-display text-3xl leading-none tracking-tight text-highlight">
                ₹0
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-6xl gap-6 p-4 md:p-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-w-0 flex-col gap-4">
          <DefaultAddressCard address={defaultAddress} />
          <section className="rounded-lg border border-default bg-default p-4 md:p-6">
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
          </section>
        </div>

        <aside className="flex flex-col self-start overflow-hidden rounded-lg border border-default bg-default lg:sticky lg:top-[calc(var(--ui-header-height)+1.5rem)]">
          <h2 className="border-b border-inverted bg-inverted px-4 py-3 font-display text-xl tracking-tight text-inverted">
            Profile
          </h2>
          <div className="@container p-4">
            <ProfileForm user={user} />
          </div>
        </aside>
      </div>
    </>
  )
}
