import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import { tv, type VariantProps } from "tailwind-variants"

import { cn } from "@/lib/utils"

export const tabsTheme = tv({
  slots: {
    list: "flex items-center gap-0 border-b border-accented",
    trigger:
      "cursor-pointer border-b-2 border-transparent px-3 py-2 text-sm font-medium text-muted outline-none -mb-px hover:text-highlighted data-[active]:border-success data-[active]:text-highlighted disabled:cursor-not-allowed disabled:opacity-50",
    content: "pt-3",
  },
})

type TabsProps = TabsPrimitive.Root.Props

function Tabs({ className, ...props }: TabsProps) {
  return (
    <TabsPrimitive.Root data-slot="tabs" className={cn(className)} {...props} />
  )
}

type TabsListProps = TabsPrimitive.List.Props & VariantProps<typeof tabsTheme>

function TabsList({
  className,
  activateOnFocus = true,
  ...props
}: TabsListProps) {
  const { list } = tabsTheme()
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      activateOnFocus={activateOnFocus}
      className={cn(list(), className)}
      {...props}
    />
  )
}

type TabsTriggerProps = TabsPrimitive.Tab.Props

function TabsTrigger({ className, ...props }: TabsTriggerProps) {
  const { trigger } = tabsTheme()
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(trigger(), className)}
      {...props}
    />
  )
}

type TabsContentProps = TabsPrimitive.Panel.Props

function TabsContent({ className, ...props }: TabsContentProps) {
  const { content } = tabsTheme()
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn(content(), className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
export type { TabsProps, TabsListProps, TabsTriggerProps, TabsContentProps }
