import { DownloadIcon } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

import { BentoCell, BentoGrid, BentoTitle } from "@/components/layout/bento"
import { Badge } from "@/components/ui/badge"
import {
  getQrCode,
  listMenuItems,
} from "@/features/restaurant/api/restaurant-api"
import { CopyButton } from "@/features/restaurant/components/copy-button"
import { RemoteImage } from "@/features/restaurant/components/remote-image"
import { ShareButton } from "@/features/restaurant/components/share-button"
import { StatusToggle } from "@/features/restaurant/components/status-toggle"
import { getMyRestaurant } from "@/features/restaurant/session"
import { getAccessToken } from "@/features/auth/session"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "Overview" }

export default async function RestaurantOverviewPage() {
  const restaurant = await getMyRestaurant()
  if (!restaurant) return null

  const accessToken = await getAccessToken()
  const [items, qrCode] = accessToken
    ? await Promise.all([
        listMenuItems(accessToken, restaurant.id),
        getQrCode(accessToken, restaurant.id),
      ])
    : [[], null]

  const availableCount = items.filter((item) => item.isAvailable).length
  const categoryCount = new Set(items.map((item) => item.category)).size

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

  return (
    <div className="flex flex-col">
      <div className="relative">
        <RemoteImage
          src={restaurant.bannerUrl}
          alt=""
          className="h-24 w-full border-b-2 border-inverted bg-elevated md:h-32"
          fallback={
            <div
              className="size-full"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(135deg, var(--ui-bg-accented) 0 12px, var(--ui-bg-elevated) 12px 24px)",
              }}
            />
          }
        />
        <div className="flex items-center gap-3 px-4 md:px-6">
          <RemoteImage
            src={restaurant.logoUrl}
            alt=""
            className="-mt-8 size-16 shrink-0 border-2 border-inverted bg-default md:size-20"
            fallback={
              <span className="font-display text-2xl uppercase">
                {restaurant.name.charAt(0)}
              </span>
            }
          />
          <h1 className="font-display text-2xl uppercase md:text-3xl">
            {restaurant.name}
          </h1>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 md:px-6">
          <div className="flex flex-wrap items-center gap-1.5">
            {restaurant.isPureVeg ? (
              <Badge color="success" variant="soft">
                Pure veg
              </Badge>
            ) : null}
            {restaurant.cuisines.map((cuisine) => (
              <Badge key={cuisine} color="neutral" variant="soft">
                {cuisine}
              </Badge>
            ))}
          </div>
          <StatusToggle
            restaurantId={restaurant.id}
            initialStatus={restaurant.status}
          />
        </div>
      </div>

      <BentoGrid className="grid-cols-2 md:grid-cols-4">
        {[
          { label: "Menu items", value: items.length },
          { label: "Available", value: availableCount },
          { label: "Sold out", value: items.length - availableCount },
          { label: "Categories", value: categoryCount },
        ].map((stat, i) => (
          <BentoCell
            key={stat.label}
            className={cn("gap-0.5 p-3 md:px-4", i % 2 === 0 && "border-r-2")}
          >
            <span className="font-display text-2xl uppercase md:text-4xl">
              {stat.value}
            </span>
            <BentoTitle>{stat.label}</BentoTitle>
          </BentoCell>
        ))}
      </BentoGrid>

      <BentoGrid className="md:grid-cols-2">
        <BentoCell className="p-3 md:p-4">
          <BentoTitle>Public menu</BentoTitle>
          {qrCode ? (
            <>
              <div className="flex items-start gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element -- data: URL, not a remote host */}
                <img
                  src={qrCode.pngDataUrl}
                  alt="QR code for the public menu"
                  className="size-20 border-2 border-inverted"
                />
                <div className="flex min-w-0 flex-col gap-2">
                  <p className="truncate font-mono text-xs text-muted">
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
                      className="inline-flex items-center gap-1 px-2.5 py-1 font-mono text-[11px] font-medium tracking-wider uppercase ring-2 ring-accented hover:bg-elevated"
                    >
                      <DownloadIcon aria-hidden className="size-3.5" />
                      Download
                    </a>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </BentoCell>

        <BentoCell className="p-3 md:p-4">
          <BentoTitle>Finish setting up</BentoTitle>
          <ul className="flex flex-col gap-1.5">
            {checklist.map((task) => (
              <li key={task.label}>
                <Link
                  href={task.href}
                  className="flex items-center gap-2 font-mono text-xs uppercase"
                >
                  <span
                    className={
                      task.done
                        ? "flex size-4 items-center justify-center bg-highlight text-[10px] text-neutral-950"
                        : "size-4 ring-2 ring-accented"
                    }
                    aria-hidden
                  >
                    {task.done ? "✓" : ""}
                  </span>
                  <span className={task.done ? "text-muted line-through" : ""}>
                    {task.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </BentoCell>
      </BentoGrid>
    </div>
  )
}
