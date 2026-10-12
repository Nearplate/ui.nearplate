import { cn } from "@/lib/utils"

const DEFAULT_WORDS = [
  "North Indian",
  "Dosa",
  "Biryani",
  "Chaat",
  "Momos",
  "Thali",
  "Pizza",
  "Kebabs",
  "Desserts",
  "Filter coffee",
]

interface CuisineMarqueeProps {
  words?: readonly string[]
  className?: string
}

/** A slow ticker of food words. Static (and wrapping) for reduced motion. */
export function CuisineMarquee({
  words = DEFAULT_WORDS,
  className,
}: CuisineMarqueeProps) {
  const row = (hidden: boolean) => (
    <ul
      aria-hidden={hidden || undefined}
      className="flex shrink-0 items-center gap-6 pr-6"
    >
      {words.map((word) => (
        <li key={word} className="flex items-center gap-6 whitespace-nowrap">
          {word}
          <span aria-hidden className="text-highlight">
            ✱
          </span>
        </li>
      ))}
    </ul>
  )

  return (
    <div
      className={cn(
        "overflow-hidden border-b-2 border-inverted bg-inverted py-2.5 font-display text-2xl text-inverted uppercase md:text-3xl",
        className
      )}
    >
      <div className="flex w-max motion-safe:animate-marquee motion-reduce:w-full motion-reduce:flex-wrap">
        {row(false)}
        <div className="motion-reduce:hidden">{row(true)}</div>
      </div>
    </div>
  )
}
