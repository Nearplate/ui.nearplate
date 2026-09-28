"use client"

import { useState, useTransition } from "react"

import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

import { setRestaurantStatusAction } from "../actions"
import type { RestaurantStatus } from "../schemas"

interface StatusToggleProps {
  restaurantId: string
  initialStatus: RestaurantStatus
}

/** Puts the restaurant online or offline, optimistically. */
export function StatusToggle({
  restaurantId,
  initialStatus,
}: StatusToggleProps) {
  const [status, setStatus] = useState(initialStatus)
  const [isPending, startTransition] = useTransition()
  const isOnline = status === "online"

  function toggle(checked: boolean) {
    const next: RestaurantStatus = checked ? "online" : "offline"
    setStatus(next)
    startTransition(async () => {
      try {
        await setRestaurantStatusAction(restaurantId, next)
      } catch {
        setStatus(status)
      }
    })
  }

  return (
    <div className="flex items-center gap-3">
      <Switch
        checked={isOnline}
        onCheckedChange={toggle}
        disabled={isPending}
        aria-label="Restaurant status"
      />
      <span
        className={cn(
          "font-mono text-sm font-medium uppercase",
          isOnline ? "text-default" : "text-muted"
        )}
      >
        {isOnline ? "Online" : "Offline"}
      </span>
    </div>
  )
}
