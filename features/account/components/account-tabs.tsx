"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const ACCOUNT_TABS = ["orders", "addresses", "payments"] as const
type AccountTab = (typeof ACCOUNT_TABS)[number]

function isAccountTab(value: string | null): value is AccountTab {
  return (ACCOUNT_TABS as readonly string[]).includes(value ?? "")
}

interface AccountTabsProps {
  orders: React.ReactNode
  addresses: React.ReactNode
  payments: React.ReactNode
}

/** Orders, Address book and Payment methods, with the active tab kept in `?tab=`. */
export function AccountTabs({ orders, addresses, payments }: AccountTabsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeTab = isAccountTab(searchParams.get("tab"))
    ? (searchParams.get("tab") as AccountTab)
    : "orders"

  function onValueChange(value: unknown) {
    const params = new URLSearchParams(searchParams)
    params.set("tab", String(value))
    params.delete("page")
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <Tabs value={activeTab} onValueChange={onValueChange}>
      <TabsList>
        <TabsTrigger value="orders">Orders</TabsTrigger>
        <TabsTrigger value="addresses">Address book</TabsTrigger>
        <TabsTrigger value="payments">Payment methods</TabsTrigger>
      </TabsList>
      <TabsContent value="orders">{orders}</TabsContent>
      <TabsContent value="addresses">{addresses}</TabsContent>
      <TabsContent value="payments">{payments}</TabsContent>
    </Tabs>
  )
}
