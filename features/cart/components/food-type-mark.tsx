import { FOOD_TYPE_LABELS, type FoodType } from "@/features/restaurant/schemas"
import { cn } from "@/lib/utils"

const FOOD_TYPE_DOT: Record<FoodType, string> = {
  veg: "bg-success",
  egg: "bg-warning",
  "non-veg": "bg-error",
}
const FOOD_TYPE_RING: Record<FoodType, string> = {
  veg: "ring-success",
  egg: "ring-warning",
  "non-veg": "ring-error",
}

interface FoodTypeMarkProps {
  foodType: FoodType
}

/** The veg / egg / non-veg indicator: a coloured dot inside a coloured square. */
export function FoodTypeMark({ foodType }: FoodTypeMarkProps) {
  return (
    <span
      role="img"
      aria-label={FOOD_TYPE_LABELS[foodType]}
      className={cn(
        "inline-flex size-3.5 shrink-0 items-center justify-center ring-2 ring-inset",
        FOOD_TYPE_RING[foodType]
      )}
    >
      <span className={cn("size-1.5 rounded-full", FOOD_TYPE_DOT[foodType])} />
    </span>
  )
}
