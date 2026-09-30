import { MinusIcon, PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface QuantityStepperProps {
  quantity: number
  itemName: string
  onIncrement: () => void
  onDecrement: () => void
  /** Disables every control (e.g. the restaurant closed). */
  disabled?: boolean
  /** Disables only "more" (sold out, or the per-line maximum is reached). */
  incrementDisabled?: boolean
  /** Sizing/layout for the outer element, e.g. `w-full` to fill a column. */
  className?: string
}

/** An "Add" button that becomes a − quantity + control once the item is in the cart. */
export function QuantityStepper({
  quantity,
  itemName,
  onIncrement,
  onDecrement,
  disabled = false,
  incrementDisabled = false,
  className,
}: QuantityStepperProps) {
  if (quantity === 0) {
    return (
      <Button
        type="button"
        size="sm"
        className={className}
        disabled={disabled || incrementDisabled}
        onClick={onIncrement}
        aria-label={`Add ${itemName}`}
      >
        Add
      </Button>
    )
  }

  return (
    <div
      role="group"
      aria-label={`${itemName} quantity`}
      className={cn(
        "inline-flex items-center justify-between border-2 border-inverted",
        className
      )}
    >
      <Button
        type="button"
        variant="ghost"
        color="neutral"
        size="sm"
        square
        disabled={disabled}
        onClick={onDecrement}
        aria-label={`Remove one ${itemName}`}
      >
        <MinusIcon aria-hidden />
      </Button>
      <span
        aria-live="polite"
        className="min-w-7 flex-1 px-1 text-center font-mono text-xs"
      >
        {quantity}
      </span>
      <Button
        type="button"
        variant="ghost"
        color="neutral"
        size="sm"
        square
        disabled={disabled || incrementDisabled}
        onClick={onIncrement}
        aria-label={`Add one more ${itemName}`}
      >
        <PlusIcon aria-hidden />
      </Button>
    </div>
  )
}
