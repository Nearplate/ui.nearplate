"use client"

import { cn } from "@/lib/utils"

import type { SignupRole } from "../schemas"

const OPTIONS: ReadonlyArray<{ value: SignupRole; label: string }> = [
  { value: "user", label: "I'm hungry" },
  { value: "restaurant", label: "I own a restaurant" },
]

interface RoleToggleProps {
  value: SignupRole
  onChange: (role: SignupRole) => void
}

/** Segmented control backed by native radios, so the value posts with the form. */
export function RoleToggle({ value, onChange }: RoleToggleProps) {
  return (
    <fieldset className="grid grid-cols-2 border-2 border-inverted">
      <legend className="sr-only">Account type</legend>
      {OPTIONS.map((option) => (
        <label
          key={option.value}
          className={cn(
            "cursor-pointer px-2 py-1.5 text-center font-mono text-[11px] font-medium tracking-wider uppercase has-[:focus-visible]:outline-2 has-[:focus-visible]:-outline-offset-4",
            value === option.value
              ? "bg-inverted text-inverted"
              : "bg-default hover:bg-elevated"
          )}
        >
          <input
            type="radio"
            name="role"
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="sr-only"
          />
          {option.label}
        </label>
      ))}
    </fieldset>
  )
}
