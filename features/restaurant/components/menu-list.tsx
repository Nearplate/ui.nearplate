"use client"

import { PlusIcon, SearchIcon, SlidersHorizontalIcon } from "lucide-react"
import { useMemo, useState, useTransition } from "react"

import { Badge } from "@/components/ui/badge"
import { Button, buttonTheme } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Select } from "@/components/ui/select"

import { deleteMenuItemAction } from "../actions"
import type { MenuItem } from "../schemas"
import { MenuItemDialog } from "./menu-item-dialog"
import { MenuItemRow } from "./menu-item-row"

const AVAILABILITY_OPTIONS = [
  { value: "all", label: "All" },
  { value: "available", label: "Available" },
  { value: "sold-out", label: "Sold out" },
] as const

interface MenuListProps {
  restaurantId: string
  items: MenuItem[]
}

/** Search, category and availability filters, grouped list, add/edit/delete. */
export function MenuList({ restaurantId, items }: MenuListProps) {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [availability, setAvailability] =
    useState<(typeof AVAILABILITY_OPTIONS)[number]["value"]>("all")
  const [editing, setEditing] = useState<MenuItem | null | undefined>(undefined)
  const [deleting, setDeleting] = useState<MenuItem | null>(null)
  const [isDeleting, startDeleteTransition] = useTransition()

  const categories = useMemo(
    () => Array.from(new Set(items.map((item) => item.category))).sort(),
    [items]
  )

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return items.filter((item) => {
      if (query && !item.name.toLowerCase().includes(query)) return false
      if (category !== "all" && item.category !== category) return false
      if (availability === "available" && !item.isAvailable) return false
      if (availability === "sold-out" && item.isAvailable) return false
      return true
    })
  }, [items, search, category, availability])

  const activeFilterCount =
    (category !== "all" ? 1 : 0) + (availability !== "all" ? 1 : 0)

  const grouped = useMemo(() => {
    const map = new Map<string, MenuItem[]>()
    for (const item of filtered) {
      const list = map.get(item.category) ?? []
      list.push(item)
      map.set(item.category, list)
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [filtered])

  function confirmDelete() {
    if (!deleting) return
    const item = deleting
    startDeleteTransition(async () => {
      await deleteMenuItemAction(restaurantId, item.id)
      setDeleting(null)
    })
  }

  return (
    <div className="flex flex-col gap-3 p-3 md:p-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <div className="relative md:max-w-xs md:flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dishes..."
            className="pl-8"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 md:flex">
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-auto"
            >
              <option value="all">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
            <Select
              value={availability}
              onChange={(e) =>
                setAvailability(e.target.value as typeof availability)
              }
              className="w-auto"
            >
              {AVAILABILITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <Popover>
            <PopoverTrigger
              className={buttonTheme({
                variant: "outline",
                color: "neutral",
                className: "md:hidden",
              })}
            >
              <SlidersHorizontalIcon aria-hidden className="size-3.5" />
              Filters
              {activeFilterCount > 0 ? (
                <Badge size="sm">{activeFilterCount}</Badge>
              ) : null}
            </PopoverTrigger>
            <PopoverContent align="start" className="flex flex-col gap-3">
              <label className="flex flex-col gap-1 font-mono text-[11px] tracking-wider uppercase">
                Category
                <Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="all">All categories</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </label>
              <label className="flex flex-col gap-1 font-mono text-[11px] tracking-wider uppercase">
                Availability
                <Select
                  value={availability}
                  onChange={(e) =>
                    setAvailability(e.target.value as typeof availability)
                  }
                >
                  {AVAILABILITY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </label>
            </PopoverContent>
          </Popover>

          <Button
            type="button"
            onClick={() => setEditing(null)}
            className="ml-auto md:ml-0"
          >
            <PlusIcon aria-hidden className="size-3.5" />
            Add item
          </Button>
        </div>
      </div>

      {grouped.length === 0 ? (
        <div className="flex flex-col items-center gap-3 border-2 border-dashed border-accented p-8 text-center">
          <p className="font-display text-2xl uppercase">No dishes yet</p>
          <p className="text-sm text-muted">
            Add your first dish to start building your menu.
          </p>
          <Button type="button" onClick={() => setEditing(null)}>
            <PlusIcon aria-hidden className="size-3.5" />
            Add item
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {grouped.map(([groupCategory, groupItems]) => (
            <div key={groupCategory}>
              <h2 className="sticky top-0 border-b-2 border-inverted bg-default py-1.5 font-mono text-xs font-medium tracking-wider uppercase">
                {groupCategory}
                <span className="ml-1.5 text-muted">({groupItems.length})</span>
              </h2>
              <ul>
                {groupItems.map((item) => (
                  <MenuItemRow
                    key={item.id}
                    item={item}
                    restaurantId={restaurantId}
                    onEdit={setEditing}
                    onDelete={setDeleting}
                  />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <MenuItemDialog
        restaurantId={restaurantId}
        item={editing ?? null}
        categories={categories}
        open={editing !== undefined}
        onOpenChange={(open) => {
          if (!open) setEditing(undefined)
        }}
      />

      <Dialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null)
        }}
      >
        <DialogContent
          title="Delete dish?"
          description={
            deleting
              ? `"${deleting.name}" will be removed for good.`
              : undefined
          }
        >
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              color="neutral"
              onClick={() => setDeleting(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              color="error"
              loading={isDeleting}
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
