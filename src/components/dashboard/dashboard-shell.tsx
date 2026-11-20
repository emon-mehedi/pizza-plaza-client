import type { ReactNode } from "react"

import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { dashboardNav, type DashboardRole } from "@/lib/dashboard/navigation"

import { AppSidebar } from "./app-sidebar"

// Shared frame for every role dashboard. Each role layout only supplies its
// role, so navigation stays consistent and is configured in one place.
export function DashboardShell({
  role,
  children,
}: {
  role: DashboardRole
  children: ReactNode
}) {
  const { title, description } = dashboardNav[role]

  return (
    // The global navbar already fills the first 3.5rem of the viewport.
    <SidebarProvider className="min-h-0! flex-1">
      <TooltipProvider>
        <AppSidebar role={role} />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-4" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{title}</p>
              <p className="truncate text-xs text-muted-foreground">
                {description}
              </p>
            </div>
          </header>
          <div className="flex-1">{children}</div>
        </SidebarInset>
      </TooltipProvider>
    </SidebarProvider>
  )
}
