"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  CircleUserRound,
  Pizza,
  UtensilsCrossed,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  dashboardNav,
  type DashboardNavItem,
  type DashboardRole,
} from "@/lib/dashboard/navigation"

// Available on every dashboard, regardless of role.
const sharedLinks: DashboardNavItem[] = [
  { title: "Browse menu", href: "/menu", icon: UtensilsCrossed },
  { title: "Profile settings", href: "/profile", icon: CircleUserRound },
]

// The site navbar is sticky at 3.5rem, so the fixed desktop sidebar starts below it.
const desktopSidebarClass = "top-14! h-[calc(100svh-3.5rem)]!"

export function AppSidebar({ role }: { role: DashboardRole }) {
  const pathname = usePathname()
  const config = dashboardNav[role]

  return (
    <Sidebar collapsible="icon" className={desktopSidebarClass}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link href={config.homeHref} />}
              tooltip={config.title}
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Pizza className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Pizza Plaza</span>
                <span className="truncate text-xs text-muted-foreground">
                  {config.title}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {config.items.map((item) => {
                const isActive = isActiveHref(pathname, item.href)

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={isActive}
                      aria-current={isActive ? "page" : undefined}
                      tooltip={item.title}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {sharedLinks.map((item) => {
            const isActive = isActiveHref(pathname, item.href)

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  render={<Link href={item.href} />}
                  isActive={isActive}
                  aria-current={isActive ? "page" : undefined}
                  tooltip={item.title}
                >
                  <item.icon />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

// Dashboard links are leaf routes. An exact match keeps the "Overview" link
// (the role root) from staying active on every other dashboard page.
function isActiveHref(pathname: string, href: string) {
  return pathname === href
}
