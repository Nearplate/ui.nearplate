import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardBody, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Kbd } from "@/components/ui/kbd"
import { Separator } from "@/components/ui/separator"
import { BUTTON_VARIANTS, SEMANTIC_COLORS } from "@/lib/theme/colors"

export default function Page() {
  return (
    <main className="mx-auto flex min-h-svh max-w-4xl flex-col gap-8 p-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-highlighted">
          NearPlate UI
        </h1>
        <p className="text-sm text-muted">
          Nuxt UI design system on Next.js. Press <Kbd>d</Kbd> to toggle dark
          mode.
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
    </main>
  )
}
