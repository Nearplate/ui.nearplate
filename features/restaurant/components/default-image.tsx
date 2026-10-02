import { UtensilsCrossedIcon } from "lucide-react"

import { cn } from "@/lib/utils"

interface NameTone {
  /** Static classes so Tailwind can see them. */
  avatarClass: string
  /** The `--ui-*` variable the banner pattern tints with. */
  cssVar: string
}

const NAME_TONES: readonly NameTone[] = [
  { avatarClass: "bg-primary text-inverted", cssVar: "--ui-primary" },
  { avatarClass: "bg-secondary text-inverted", cssVar: "--ui-secondary" },
  { avatarClass: "bg-success text-inverted", cssVar: "--ui-success" },
  { avatarClass: "bg-info text-inverted", cssVar: "--ui-info" },
  { avatarClass: "bg-warning text-neutral-950", cssVar: "--ui-warning" },
  { avatarClass: "bg-error text-inverted", cssVar: "--ui-error" },
  { avatarClass: "bg-highlight text-neutral-950", cssVar: "--ui-highlight" },
]

const HASH_MULTIPLIER = 31
const BANNER_TINT_PERCENT = 22

/** Same name, same tone -- like Google's coloured initial avatars. */
export function pickColorForName(name: string): NameTone {
  const normalized = name.trim().toLowerCase()
  let hash = 0
  for (const char of normalized) {
    hash = (hash * HASH_MULTIPLIER + char.charCodeAt(0)) >>> 0
  }
  return NAME_TONES[hash % NAME_TONES.length]
}

function initialOf(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?"
}

interface DefaultAvatarProps {
  name: string
  className?: string
}

/** Logo fallback: the name's initial on a colour derived from the name. */
export function DefaultAvatar({ name, className }: DefaultAvatarProps) {
  const tone = pickColorForName(name)
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-full items-center justify-center font-display uppercase",
        tone.avatarClass,
        className
      )}
    >
      {initialOf(name)}
    </span>
  )
}

/** Banner fallback: diagonal stripes tinted with the name's colour. */
export function DefaultBanner({ name }: { name: string }) {
  const { cssVar } = pickColorForName(name)
  return (
    <div
      aria-hidden
      className="size-full"
      style={{
        backgroundImage: `repeating-linear-gradient(135deg, color-mix(in srgb, var(${cssVar}) ${BANNER_TINT_PERCENT}%, var(--ui-bg-elevated)) 0 12px, var(--ui-bg-elevated) 12px 24px)`,
      }}
    />
  )
}

/** Menu-item fallback. */
export function DefaultDish({ className }: { className?: string }) {
  return (
    <UtensilsCrossedIcon
      aria-hidden
      className={cn("size-8 text-muted", className)}
    />
  )
}
