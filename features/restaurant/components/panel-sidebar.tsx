"use client"

import {
  CircleUserRoundIcon,
  LayoutGridIcon,
  LogOutIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  UserIcon,
  UtensilsIcon,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, type ComponentType } from "react"

import { Menu, MenuContent, MenuItem, MenuTrigger } from "@/components/ui/menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { logoutAction } from "@/features/auth/actions"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"

import { RemoteImage } from "./remote-image"

const SIDEBAR_COOKIE = "np_sidebar"
const NAV_ITEMS: ReadonlyArray<{
  href: string
  label: string
  icon: ComponentType<{ className?: string }>
}> = [
  { href: "/restaurant", label: "Overview", icon: LayoutGridIcon },
  { href: "/restaurant/menu", label: "Menu", icon: UtensilsIcon },
]

interface PanelSidebarProps {
  restaurantName: string
  logoUrl: string | null
  isOnline: boolean
  defaultCollapsed: boolean
}

function isActive(pathname: string, href: string): boolean {
  return href === "/restaurant" ? pathname === href : pathname.startsWith(href)
}

function persistCollapsed(collapsed: boolean): void {
  const maxAgeSeconds = 60 * 60 * 24 * 365
  document.cookie = `${SIDEBAR_COOKIE}=${collapsed ? "1" : "0"}; path=/; max-age=${maxAgeSeconds}`
}

function Logo({
  logoUrl,
  restaurantName,
}: {
  logoUrl: string | null
  restaurantName: string
}) {
  return (
    <RemoteImage
      src={logoUrl}
      alt=""
      className="size-7 shrink-0 border-2 border-inverted bg-elevated"
      fallback={
        <span className="font-display text-sm uppercase">
          {restaurantName.charAt(0)}
        </span>
      }
    />
  )
}

function NavLinks({
  pathname,
  collapsed,
  onNavigate,
}: {
  pathname: string
  collapsed: boolean
  onNavigate?: () => void
}) {
  return (
    <nav className="flex flex-col gap-0.5 p-2">
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href)
        const Icon = item.icon
        const link = (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2.5 border-l-4 py-1.5 font-mono text-xs font-medium tracking-wider uppercase",
              collapsed ? "justify-center px-0" : "px-2.5",
              active
                ? "border-highlight bg-inverted text-inverted"
                : "border-transparent hover:bg-elevated"
            )}
          >
            <Icon className="size-4 shrink-0" />
            {!collapsed && item.label}
          </Link>
        )
        if (!collapsed) return link
        return (
          <TooltipProvider key={item.href}>
            <Tooltip>
              <TooltipTrigger render={link} />
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      })}
    </nav>
  )
}

function TabBar({ pathname }: { pathname: string }) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex border-t-2 border-inverted bg-default md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 border-t-4 py-1.5 font-mono text-[10px] font-medium tracking-wider uppercase",
              active
                ? "border-highlight bg-inverted text-inverted"
                : "border-transparent"
            )}
          >
            <Icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

function AccountMenuItems() {
  return (
    <>
      <MenuItem
        render={<Link href="/restaurant/profile" />}
        className="no-underline"
      >
        <UserIcon className="size-3.5" />
        Profile
      </MenuItem>
      <form action={logoutAction} className="block">
        <MenuItem
          nativeButton
          render={<button type="submit" />}
          className="w-full"
        >
          <LogOutIcon className="size-3.5" />
          Log out
        </MenuItem>
      </form>
    </>
  )
}

function AccountMenu({ align }: { align: "start" | "end" }) {
  return (
    <Menu>
      <MenuTrigger
        aria-label="Account menu"
        className="shrink-0 cursor-pointer p-1.5 hover:bg-elevated"
      >
        <CircleUserRoundIcon className="size-5" />
      </MenuTrigger>
      <MenuContent align={align}>
        <AccountMenuItems />
      </MenuContent>
    </Menu>
  )
}

function SidebarFooter({
  restaurantName,
  logoUrl,
  isOnline,
  collapsed,
}: {
  restaurantName: string
  logoUrl: string | null
  isOnline: boolean
  collapsed: boolean
}) {
  return (
    <div className="border-t-2 border-inverted">
      <Menu>
        <MenuTrigger
          aria-label="Account menu"
          className={cn(
            "flex w-full cursor-pointer items-center gap-2 p-2 hover:bg-elevated",
            collapsed && "flex-col gap-2"
          )}
        >
          <Logo logoUrl={logoUrl} restaurantName={restaurantName} />
          {!collapsed && (
            <div className="flex min-w-0 flex-1 flex-col text-left">
              <span className="truncate font-mono text-xs font-medium">
                {restaurantName}
              </span>
              <span className="flex items-center gap-1 font-mono text-[10px] text-muted uppercase">
                <span
                  className={cn(
                    "size-2 rounded-full border border-inverted",
                    isOnline ? "bg-highlight" : "bg-accented"
                  )}
                  aria-hidden
                />
                {isOnline ? "Online" : "Offline"}
              </span>
            </div>
          )}
        </MenuTrigger>
        <MenuContent align={collapsed ? "start" : "end"}>
          <AccountMenuItems />
        </MenuContent>
      </Menu>
    </div>
  )
}

/** Foldable desktop sidebar; collapses to icon-only and remembers the state. */
export function PanelSidebar({
  restaurantName,
  logoUrl,
  isOnline,
  defaultCollapsed,
}: PanelSidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(defaultCollapsed)

  function toggle() {
    setCollapsed((prev) => {
      persistCollapsed(!prev)
      return !prev
    })
  }

  return (
    <>
      <aside
        className={cn(
          "sticky top-0 hidden h-svh shrink-0 flex-col border-r-2 border-inverted bg-default transition-[width] duration-150 md:flex",
          collapsed ? "w-16" : "w-52"
        )}
      >
        <div
          className={cn(
            "flex items-center border-b-2 border-inverted px-3 py-2",
            collapsed ? "justify-center" : "justify-between"
          )}
        >
          {!collapsed && (
            <Link href="/" className="font-display text-lg uppercase">
              {siteConfig.name}
            </Link>
          )}
          <button
            type="button"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={toggle}
            className="cursor-pointer p-1 hover:bg-elevated"
          >
            {collapsed ? (
              <PanelLeftOpenIcon className="size-4" />
            ) : (
              <PanelLeftCloseIcon className="size-4" />
            )}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <NavLinks pathname={pathname} collapsed={collapsed} />
        </div>
        <SidebarFooter
          restaurantName={restaurantName}
          logoUrl={logoUrl}
          isOnline={isOnline}
          collapsed={collapsed}
        />
      </aside>

      <div className="sticky top-0 z-30 flex items-center justify-between border-b-2 border-inverted bg-default px-3 py-2 md:hidden">
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <Logo logoUrl={logoUrl} restaurantName={restaurantName} />
          <span className="truncate font-mono text-xs font-medium uppercase">
            {restaurantName}
          </span>
        </Link>
        <AccountMenu align="end" />
      </div>
      <TabBar pathname={pathname} />
    </>
  )
}
