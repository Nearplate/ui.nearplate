"use client"

import { useActionState } from "react"

import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardBody, CardHeader } from "@/components/ui/card"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import type { FormActionState } from "@/features/auth/actions"

import { ImageDropzone } from "@/features/media/components/image-dropzone"

import { updateRestaurantAction } from "../actions"
import type { Restaurant } from "../schemas"
import { LocationFields } from "./location-fields"

const IDLE: FormActionState = { status: "idle" }

interface RestaurantProfileFormProps {
  restaurant: Restaurant
}

/** Full profile editor: identity, brand and location, in one submit. */
export function RestaurantProfileForm({
  restaurant,
}: RestaurantProfileFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateRestaurantAction,
    IDLE
  )

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="restaurantId" value={restaurant.id} />

      {state.status === "error" ? (
        <Alert tone="error">{state.message}</Alert>
      ) : null}
      {state.status === "success" ? (
        <Alert tone="highlight">Profile updated.</Alert>
      ) : null}

      <Card>
        <CardHeader>
          <h2 className="font-mono text-xs font-medium tracking-wider uppercase">
            Identity
          </h2>
        </CardHeader>
        <Separator />
        <CardBody className="flex flex-col gap-3">
          <Field label="Name" htmlFor="name">
            <Input
              id="name"
              name="name"
              defaultValue={restaurant.name}
              required
            />
          </Field>
          <Field label="Description" htmlFor="description">
            <Textarea
              id="description"
              name="description"
              maxLength={500}
              defaultValue={restaurant.description ?? ""}
            />
          </Field>
          <Field label="Cuisines (comma-separated)" htmlFor="cuisines">
            <Input
              id="cuisines"
              name="cuisines"
              defaultValue={restaurant.cuisines.join(", ")}
              required
            />
          </Field>
          <label className="flex items-center gap-2 font-mono text-xs tracking-wider uppercase">
            <Switch name="isPureVeg" defaultChecked={restaurant.isPureVeg} />
            Pure veg
          </label>
          <div className="flex flex-col gap-1 border-t-2 border-muted pt-3">
            <span className="font-mono text-[11px] text-muted uppercase">
              Public URL (slug never changes)
            </span>
            <span className="font-mono text-sm">/{restaurant.slug}</span>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-mono text-xs font-medium tracking-wider uppercase">
            Brand
          </h2>
        </CardHeader>
        <Separator />
        <CardBody className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[11px] tracking-wider uppercase">
              Logo
            </span>
            <ImageDropzone
              target={{ restaurantId: restaurant.id, kind: "logo" }}
              name={restaurant.name}
              currentUrl={restaurant.logoUrl}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[11px] tracking-wider uppercase">
              Banner
            </span>
            <ImageDropzone
              target={{ restaurantId: restaurant.id, kind: "banner" }}
              name={restaurant.name}
              currentUrl={restaurant.bannerUrl}
            />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-mono text-xs font-medium tracking-wider uppercase">
            Location
          </h2>
        </CardHeader>
        <Separator />
        <CardBody>
          <LocationFields
            initialLat={restaurant.coordinates[1]}
            initialLng={restaurant.coordinates[0]}
            initialAddress={restaurant.address}
            required
          />
        </CardBody>
      </Card>

      <Button type="submit" loading={isPending} block>
        Save changes
      </Button>
    </form>
  )
}
