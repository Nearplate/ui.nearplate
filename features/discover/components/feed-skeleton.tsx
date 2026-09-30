const PLACEHOLDERS = 4

/** Shown while the nearby query is in flight. */
export function FeedSkeleton() {
  return (
    <div aria-hidden className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: PLACEHOLDERS }, (_, index) => (
        <div
          key={index}
          className="h-64 animate-pulse border-2 border-inverted bg-elevated"
        />
      ))}
    </div>
  )
}
