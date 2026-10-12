const PLACEHOLDERS = 4

/** Shown while the nearby query is in flight: card-shaped placeholders. */
export function FeedSkeleton() {
  return (
    <div
      aria-hidden
      className="grid gap-4 p-4 sm:grid-cols-2 md:gap-5 md:p-6 lg:grid-cols-4"
    >
      {Array.from({ length: PLACEHOLDERS }, (_, index) => (
        <div
          key={index}
          className="flex flex-col overflow-hidden rounded-lg border border-default"
        >
          <div className="aspect-[16/9] animate-pulse border-b border-default bg-elevated" />
          <div className="flex flex-col gap-2 p-3 pt-7">
            <div className="h-6 w-2/3 animate-pulse bg-accented" />
            <div className="h-3 w-1/2 animate-pulse bg-elevated" />
            <div className="mt-2 h-3 w-1/4 animate-pulse bg-elevated" />
          </div>
        </div>
      ))}
    </div>
  )
}
