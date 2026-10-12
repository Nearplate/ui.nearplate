import { cn } from "@/lib/utils"

const BARS = [
  {
    label: "Typical delivery app",
    caption: "A cut of every order leaves the kitchen",
    kitchenShare: 70,
    tone: "muted",
  },
  {
    label: "NearPlate",
    caption: "The full menu price stays with the kitchen",
    kitchenShare: 100,
    tone: "highlight",
  },
] as const

/**
 * Where the money goes, as two bars. The "typical" bar is illustrative, so
 * it is labelled as such rather than given a precise figure.
 */
export function FairShare() {
  return (
    <section
      aria-labelledby="fair-title"
      className="grid border-b-2 border-inverted lg:grid-cols-[1fr_1.4fr]"
    >
      <div className="flex flex-col gap-3 border-b-2 border-inverted bg-inverted p-4 text-inverted md:p-8 lg:border-r-2 lg:border-b-0">
        <p className="font-mono text-[11px] tracking-wider text-highlight uppercase">
          Where your money goes
        </p>
        <h2
          id="fair-title"
          className="font-display text-5xl leading-[0.9] uppercase md:text-6xl"
        >
          Every rupee
          <br />
          to the kitchen.
        </h2>
        <p className="max-w-sm text-sm opacity-75">
          Commission-based apps push restaurants to raise menu prices. We
          don&apos;t take a cut, so they don&apos;t have to.
        </p>
      </div>
      <div className="flex flex-col justify-center gap-6 p-4 md:p-8">
        {BARS.map((bar) => (
          <div key={bar.label} className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-display text-2xl uppercase">
                {bar.label}
              </span>
              <span className="font-mono text-[11px] tracking-wider text-muted uppercase">
                {bar.caption}
              </span>
            </div>
            <div
              role="img"
              aria-label={`${bar.label}: the kitchen keeps ${bar.tone === "highlight" ? "all" : "part"} of the order value`}
              className="flex h-12 border-2 border-inverted"
            >
              <div
                className={cn(
                  "flex items-center px-3 font-mono text-[11px] font-medium tracking-wider uppercase",
                  bar.tone === "highlight"
                    ? "bg-highlight text-neutral-950"
                    : "bg-accented text-default"
                )}
                style={{ width: `${bar.kitchenShare}%` }}
              >
                Kitchen
              </div>
              {bar.kitchenShare < 100 ? (
                <div className="flex flex-1 items-center justify-center bg-dots font-mono text-[11px] tracking-wider text-muted uppercase">
                  App
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
