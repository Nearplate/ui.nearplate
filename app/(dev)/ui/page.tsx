"use client"

import { notFound } from "next/navigation"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardBody, CardHeader } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Menu, MenuContent, MenuItem, MenuTrigger } from "@/components/ui/menu"
import { Select } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { RestaurantCard } from "@/features/discover/components/restaurant-card"
import type { NearbyRestaurant } from "@/features/discover/schemas"
import { BUTTON_VARIANTS, SEMANTIC_COLORS } from "@/lib/theme/colors"

const SAMPLE_RESTAURANT: NearbyRestaurant = {
  id: "sample",
  slug: "spice-house",
  name: "Spice House",
  status: "online",
  cuisines: ["biryani", "mughlai"],
  isPureVeg: true,
  description: null,
  logoUrl: null,
  bannerUrl: null,
  coordinates: [77.2, 28.6],
  address: {
    id: "sample-address",
    line1: "12 Main Street",
    line2: null,
    city: "Delhi",
    state: "DL",
    zipcode: "110001",
    phoneNumber: null,
  },
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  distanceMeters: 850,
}

export default function Page() {
  // Component gallery for development only.
  if (process.env.NODE_ENV === "production") notFound()
  const [checked, setChecked] = useState(true)

  return (
    <main className="mx-auto flex min-h-svh max-w-4xl flex-col gap-8 p-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-highlighted">
          NearPlate UI
        </h1>
        <p className="text-sm text-muted">
          Component gallery for the Nuxt UI-style design system.
        </p>
      </header>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-highlighted">Buttons</h2>
        </CardHeader>
        <Separator />
        <CardBody className="flex flex-col gap-4">
          {BUTTON_VARIANTS.map((variant) => (
            <div key={variant} className="flex flex-wrap items-center gap-2">
              {SEMANTIC_COLORS.map((color) => (
                <Button key={color} color={color} variant={variant}>
                  {color}
                </Button>
              ))}
            </div>
          ))}
          <div className="flex flex-wrap items-center gap-2">
            <Button size="xs">xs</Button>
            <Button size="sm">sm</Button>
            <Button size="md">md</Button>
            <Button size="lg">lg</Button>
            <Button size="xl">xl</Button>
            <Button loading>Loading</Button>
            <Button disabled>Disabled</Button>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-highlighted">Badges and inputs</h2>
        </CardHeader>
        <Separator />
        <CardBody className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {SEMANTIC_COLORS.map((color) => (
              <Badge key={color} color={color} variant="subtle">
                {color}
              </Badge>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input placeholder="Search restaurants..." />
            <Input placeholder="Invalid" aria-invalid />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-highlighted">
            Textarea, select and switch
          </h2>
        </CardHeader>
        <Separator />
        <CardBody className="flex flex-col gap-4">
          <Textarea placeholder="Tell diners about your kitchen..." />
          <Select defaultValue="mains">
            <option value="mains">Mains</option>
            <option value="starters">Starters</option>
            <option value="desserts">Desserts</option>
          </Select>
          <div className="flex items-center gap-2">
            <Switch checked={checked} onCheckedChange={setChecked} />
            <span className="font-mono text-xs uppercase">
              {checked ? "Online" : "Offline"}
            </span>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-highlighted">
            Dialog, menu and tooltip
          </h2>
        </CardHeader>
        <Separator />
        <CardBody className="flex flex-wrap items-center gap-2">
          <Dialog>
            <DialogTrigger
              render={<Button variant="outline" color="neutral" />}
            >
              Open dialog
            </DialogTrigger>
            <DialogContent
              title="Delete dish?"
              description="This cannot be undone."
            >
              <DialogFooter>
                <Button variant="outline" color="neutral">
                  Cancel
                </Button>
                <Button color="error">Delete</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Menu>
            <MenuTrigger render={<Button variant="outline" color="neutral" />}>
              Open menu
            </MenuTrigger>
            <MenuContent>
              <MenuItem>Profile</MenuItem>
              <MenuItem>Log out</MenuItem>
            </MenuContent>
          </Menu>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                render={<Button variant="outline" color="neutral" />}
              >
                Hover me
              </TooltipTrigger>
              <TooltipContent>A helpful hint</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-highlighted">Tabs</h2>
        </CardHeader>
        <Separator />
        <CardBody>
          <Tabs defaultValue="orders">
            <TabsList>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="addresses">Address book</TabsTrigger>
              <TabsTrigger value="payments">Payment methods</TabsTrigger>
            </TabsList>
            <TabsContent value="orders">Orders panel</TabsContent>
            <TabsContent value="addresses">Address book panel</TabsContent>
            <TabsContent value="payments">Payment methods panel</TabsContent>
          </Tabs>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-highlighted">Restaurant card</h2>
        </CardHeader>
        <Separator />
        <CardBody>
          <RestaurantCard restaurant={SAMPLE_RESTAURANT} className="max-w-64" />
        </CardBody>
      </Card>
    </main>
  )
}
