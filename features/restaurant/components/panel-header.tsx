import type * as React from "react"

interface PanelHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
}

/** Page title for a panel screen, with an optional actions slot. */
export function PanelHeader({ title, description, actions }: PanelHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b-2 border-inverted px-4 py-3 md:px-6 md:py-4">
      <div className="flex flex-col gap-0.5">
        <h1 className="font-display text-2xl uppercase md:text-3xl">{title}</h1>
        {description ? (
          <p className="text-xs text-muted">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex items-center gap-2">{actions}</div>
      ) : null}
    </div>
  )
}
