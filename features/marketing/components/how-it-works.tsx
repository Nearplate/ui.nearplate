import {
  BikeIcon,
  MapPinnedIcon,
  ShoppingBagIcon,
  UtensilsIcon,
} from "lucide-react"

const STEPS = [
  {
    icon: MapPinnedIcon,
    title: "Set your spot",
    body: "Share your location or search an area. We show kitchens that are open within reach.",
  },
  {
    icon: UtensilsIcon,
    title: "Pick your meal",
    body: "Real menus at real menu prices. Filter by cuisine or keep it pure veg.",
  },
  {
    icon: ShoppingBagIcon,
    title: "Place the order",
    body: "A few taps, straight to the restaurant. No hidden markup on any dish.",
  },
  {
    icon: BikeIcon,
    title: "Eat",
    body: "Track it from your account. The kitchen keeps every rupee you paid.",
  },
] as const

/** Four numbered steps, one bordered cell each. */
export function HowItWorks() {
  return (
    <section
      id="how"
      aria-labelledby="how-title"
      className="scroll-mt-(--ui-header-height) border-b-2 border-inverted"
    >
      <div className="flex flex-wrap items-end justify-between gap-2 border-b-2 border-inverted px-4 py-5 md:px-6">
        <h2
          id="how-title"
          className="font-display text-4xl leading-none uppercase md:text-5xl"
        >
          How it works
        </h2>
        <p className="font-mono text-[11px] tracking-wider text-muted uppercase">
          Four steps. No fine print.
        </p>
      </div>
      <ol className="grid sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, index) => {
          const Icon = step.icon
          return (
            <li
              key={step.title}
              className="group flex flex-col gap-4 border-b-2 border-inverted p-4 transition-colors hover:bg-highlight hover:text-neutral-950 sm:odd:border-r-2 md:p-6 lg:border-r-2 lg:border-b-0 lg:last:border-r-0"
            >
              <div className="flex items-start justify-between">
                <span className="font-display text-6xl leading-none text-default group-hover:text-neutral-950">
                  0{index + 1}
                </span>
                <span className="grid size-10 place-items-center border-2 border-inverted bg-default">
                  <Icon aria-hidden className="size-5" />
                </span>
              </div>
              <h3 className="font-display text-2xl uppercase">{step.title}</h3>
              <p className="text-sm text-toned group-hover:text-neutral-950">
                {step.body}
              </p>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
