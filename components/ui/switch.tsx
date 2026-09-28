import { Switch as SwitchPrimitive } from "@base-ui/react/switch"
import { tv, type VariantProps } from "tailwind-variants"

import { cn } from "@/lib/utils"

export const switchTheme = tv({
  slots: {
    root: "inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full bg-accented ring-2 ring-inset ring-accented transition-colors data-[checked]:bg-highlight data-[checked]:ring-inverted disabled:cursor-not-allowed disabled:opacity-75",
    thumb:
      "size-3.5 translate-x-0.5 rounded-full bg-default ring-2 ring-inset ring-accented transition-transform data-[checked]:translate-x-4 data-[checked]:ring-inverted",
  },
})

type SwitchProps = SwitchPrimitive.Root.Props & VariantProps<typeof switchTheme>

/** An on/off control; `checked` follows Nuxt UI's on-state convention (lime). */
function Switch({ className, ...props }: SwitchProps) {
  const { root, thumb } = switchTheme()
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(root(), className)}
      {...props}
    >
      <SwitchPrimitive.Thumb data-slot="switch-thumb" className={thumb()} />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
export type { SwitchProps }
