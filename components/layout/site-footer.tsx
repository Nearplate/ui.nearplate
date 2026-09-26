import { siteConfig } from "@/config/site"

export function SiteFooter() {
  return (
    <footer className="flex flex-wrap items-center justify-between gap-2 px-3 py-3 font-mono text-[11px] tracking-wider uppercase">
      <span className="font-display text-lg tracking-tight">
        {siteConfig.name}
      </span>
      <span className="text-muted">
        © {new Date().getFullYear()} {siteConfig.name}. Zero-commission food
        delivery.
      </span>
    </footer>
  )
}
