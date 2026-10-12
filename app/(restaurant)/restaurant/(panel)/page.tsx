import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  CheckIcon,
  DownloadIcon,
} from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { buttonTheme } from "@/components/ui/button"
import { getAccessToken } from "@/features/auth/session"
import { InlineImageEditor } from "@/features/media/components/inline-image-editor"
import { listRestaurantOrders } from "@/features/restaurant/api/order-api"
import {
  getQrCode,
  listMenuItems,
} from "@/features/restaurant/api/restaurant-api"
import { CopyButton } from "@/features/restaurant/components/copy-button"
import { ShareButton } from "@/features/restaurant/components/share-button"
import { StatusToggle } from "@/features/restaurant/components/status-toggle"
import { formatPaise } from "@/features/restaurant/money"
import { timeAgo, todayStats } from "@/features/restaurant/orders"
import { getMyRestaurant } from "@/features/restaurant/session"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "Overview" }

const LIVE_PREVIEW = 4
const SHORT_ID_LENGTH = 8

function greeting(now: Date): string {
  const hour = Number(
    new Intl.DateTimeFormat("en-IN", {
      hour: "numeric",
      hourCycle: "h23",
      timeZone: "Asia/Kolkata",
    }).format(now)
  )
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

export default async function RestaurantOverviewPage() {
  const restaurant = await getMyRestaurant()
  if (!restaurant) return null

  const accessToken = await getAccessToken()
  const [items, qrCode, orders] = accessToken
    ? await Promise.all([
        listMenuItems(accessToken, restaurant.id),
        getQrCode(accessToken, restaurant.id),
        listRestaurantOrders(accessToken, restaurant.id),
      ])
    : [[], null, []]

  const now = new Date()
  const today = todayStats(orders, now)
  const liveOrders = orders.filter(
    (order) => order.status !== "delivered" && order.status !== "cancelled"
  )
  const availableCount = items.filter((item) => item.isAvailable).length

  const checklist = [
    {
      label: "Add a logo",
      done: Boolean(restaurant.logoUrl),
      href: "/restaurant/profile",
    },
    {
      label: "Add a banner",
      done: Boolean(restaurant.bannerUrl),
      href: "/restaurant/profile",
    },
    {
      label: "Write a description",
      done: Boolean(restaurant.description),
      href: "/restaurant/profile",
    },
    {
      label: "Add your first dish",
      done: items.length > 0,
      href: "/restaurant/menu",
    },
    {
      label: "Go online",
      done: restaurant.status === "online",
      href: "/restaurant",
    },
  ]
  const doneCount = checklist.filter((task) => task.done).length

  const stats = [
    {
      label: "Live orders",
      value: String(liveOrders.length),
      href: "/restaurant/orders",
      tone: liveOrders.length > 0 ? "highlight" : "default",
    },
    { label: "Orders today", value: String(today.orders), tone: "default" },
    {
      label: "Delivered revenue today",
      value: formatPaise(today.revenueInPaise),
      tone: "dark",
    },
    {
      label: "Average order today",
      value: formatPaise(today.averageInPaise),
      tone: "default",
    },
  ] as const

  return (
    <div className="flex flex-col">
      <div className="relative">
        <InlineImageEditor
          restaurantId={restaurant.id}
          kind="banner"
          name={restaurant.name}
          currentUrl={restaurant.bannerUrl}
          className="h-28 border-b-2 border-inverted bg-elevated md:h-40"
        />
        <div className="flex flex-wrap items-end gap-4 px-4 pb-4 md:px-6">
          <InlineImageEditor
            restaurantId={restaurant.id}
            kind="logo"
            name={restaurant.name}
            currentUrl={restaurant.logoUrl}
            className="relative -mt-10 size-20 shrink-0 border-2 border-inverted bg-default shadow-brutal md:size-24"
          />
          <div className="flex min-w-0 flex-1 flex-col gap-1 pt-2">
            <p className="font-mono text-[11px] tracking-wider text-muted uppercase">
              {greeting(now)}
            </p>
            <h1 className="truncate font-display text-4xl leading-none uppercase md:text-5xl">
              {restaurant.name}
            </h1>
            <div className="flex flex-wrap items-center gap-1.5">
              {restaurant.isPureVeg ? (
                <Badge color="success" variant="subtle">
                  Pure veg
                </Badge>
              ) : null}
              {restaurant.cuisines.map((cuisine) => (
                <Badge key={cuisine} color="neutral" variant="soft">
                  {cuisine}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="border-2 border-inverted px-3 py-2 shadow-brutal-sm">
              <StatusToggle
                restaurantId={restaurant.id}
                initialStatus={restaurant.status}
              />
            </div>
            <Link
              href={`/r/${restaurant.slug}`}
              target="_blank"
              className={buttonTheme({ variant: "outline", color: "neutral" })}
            >
              Public page
              <ArrowUpRightIcon aria-hidden />
            </Link>
          </div>
        </div>
      </div>

      <dl className="grid grid-cols-2 border-y-2 border-inverted lg:grid-cols-4">
        {stats.map((stat, index) => {
          const body = (
            <>
              <dt className="font-mono text-[11px] tracking-wider uppercase opacity-80">
                {stat.label}
              </dt>
              <dd className="font-display text-3xl leading-none md:text-5xl">
                {stat.value}
              </dd>
            </>
          )
          const className = cn(
            "flex flex-col-reverse justify-end gap-2 p-4 md:p-6",
            index % 2 === 1 && "border-l-2 border-inverted",
            index >= 2 && "border-t-2 border-inverted lg:border-t-0",
            index === 2 && "lg:border-l-2",
            stat.tone === "highlight" && "bg-highlight text-neutral-950",
            stat.tone === "dark" && "bg-inverted text-inverted"
          )
          return "href" in stat ? (
            <Link
              key={stat.label}
              href={stat.href}
              className={cn(className, "group hover:underline")}
            >
              {body}
            </Link>
          ) : (
            <div key={stat.label} className={className}>
              {body}
            </div>
          )
        })}
      </dl>

      <div className="grid gap-6 p-4 md:p-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section className="flex flex-col border-2 border-inverted">
          <header className="flex items-center justify-between gap-2 border-b-2 border-inverted px-4 py-3">
            <h2 className="font-display text-2xl uppercase">Live orders</h2>
            <Link
              href="/restaurant/orders"
              className="inline-flex items-center gap-1 font-mono text-[11px] font-medium tracking-wider uppercase hover:underline"
            >
              Open board
              <ArrowRightIcon aria-hidden className="size-3.5" />
            </Link>
          </header>
          {liveOrders.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-1 bg-dots p-10 text-center">
              <p className="font-display text-2xl uppercase">All quiet</p>
              <p className="text-sm text-muted">
                {restaurant.status === "online"
                  ? "New orders show up here the moment they come in."
                  : "Go online to start taking orders."}
              </p>
            </div>
          ) : (
            <ul>
              {liveOrders.slice(0, LIVE_PREVIEW).map((order) => (
                <li
                  key={order.id}
                  className="flex items-center gap-3 border-b-2 border-muted px-4 py-3 last:border-b-0"
                >
                  <span
                    className={cn(
                      "px-1.5 py-0.5 font-mono text-[10px] tracking-wider uppercase",
                      order.status === "placed"
                        ? "bg-highlight text-neutral-950"
                        : "bg-inverted text-inverted"
                    )}
                  >
                    {order.status === "placed"
                      ? "New"
                      : order.status.replaceAll("_", " ")}
                  </span>
                  <span className="font-mono text-xs uppercase">
                    #{order.id.slice(0, SHORT_ID_LENGTH)}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-xs text-muted">
                    {order.deliveryAddress.line1}
                  </span>
                  <span className="hidden font-mono text-[11px] text-muted sm:inline">
                    {timeAgo(order.createdAt, now)}
                  </span>
                  <span className="font-mono text-sm font-medium">
                    {formatPaise(order.totalInPaise)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="flex flex-col gap-6">
          {doneCount < checklist.length ? (
            <section className="border-2 border-inverted">
              <header className="flex items-center justify-between gap-2 border-b-2 border-inverted px-4 py-3">
                <h2 className="font-display text-2xl uppercase">
                  Finish setting up
                </h2>
                <span className="font-mono text-xs">
                  {doneCount}/{checklist.length}
                </span>
              </header>
              <div className="h-2 border-b-2 border-inverted bg-elevated">
                <div
                  className="h-full bg-highlight"
                  style={{
                    width: `${(doneCount / checklist.length) * 100}%`,
                  }}
                />
              </div>
              <ul className="flex flex-col">
                {checklist.map((task) => (
                  <li key={task.label}>
                    <Link
                      href={task.href}
                      className="flex items-center gap-3 border-b-2 border-muted px-4 py-2.5 font-mono text-xs uppercase last:border-b-0 hover:bg-elevated"
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "grid size-5 place-items-center border-2 border-inverted",
                          task.done && "bg-highlight text-neutral-950"
                        )}
                      >
                        {task.done ? <CheckIcon className="size-3.5" /> : null}
                      </span>
                      <span
                        className={cn(
                          "flex-1",
                          task.done && "text-muted line-through"
                        )}
                      >
                        {task.label}
                      </span>
                      {task.done ? null : (
                        <ArrowRightIcon aria-hidden className="size-3.5" />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="border-2 border-inverted">
            <header className="flex items-center justify-between gap-2 border-b-2 border-inverted px-4 py-3">
              <h2 className="font-display text-2xl uppercase">Your menu</h2>
              <Link
                href="/restaurant/menu"
                className="inline-flex items-center gap-1 font-mono text-[11px] font-medium tracking-wider uppercase hover:underline"
              >
                Edit
                <ArrowRightIcon aria-hidden className="size-3.5" />
              </Link>
            </header>
            <div className="flex gap-4 p-4">
              {qrCode ? (
                // eslint-disable-next-line @next/next/no-img-element -- data: URL, not a remote host
                <img
                  src={qrCode.pngDataUrl}
                  alt="QR code for the public menu"
                  className="size-28 shrink-0 border-2 border-inverted"
                />
              ) : null}
              <div className="flex min-w-0 flex-col gap-3">
                <p className="text-sm">
                  <span className="font-semibold">
                    {availableCount} of {items.length}
                  </span>{" "}
                  dishes available. Print the code for your tables and counter.
                </p>
                {qrCode ? (
                  <>
                    <p className="truncate font-mono text-[11px] text-muted">
                      {qrCode.url}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <CopyButton
                        value={qrCode.url}
                        size="xs"
                        variant="outline"
                        color="neutral"
                      />
                      <ShareButton
                        title={restaurant.name}
                        url={qrCode.url}
                        size="xs"
                        variant="outline"
                        color="neutral"
                      />
                      <a
                        href={qrCode.pngDataUrl}
                        download={`${restaurant.slug}-qr.png`}
                        className={buttonTheme({
                          size: "xs",
                          variant: "outline",
                          color: "neutral",
                        })}
                      >
                        <DownloadIcon aria-hidden />
                        Download
                      </a>
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
