import { Suspense, type ReactNode } from "react"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { requireDashboardRole } from "@/lib/auth-guard"
import type { DashboardRole } from "@/lib/dashboard/navigation"

/**
 * Wraps a dashboard layout with a server-side session/role check.
 *
 * The check lives inside Suspense because reading the session is a
 * request-time read (required by next.config.ts cacheComponents).
 */
export function DashboardGuard({
  role,
  children,
}: {
  role: DashboardRole
  children: ReactNode
}) {
  return (
    <Suspense fallback={<GuardFallback />}>
      <GuardedShell role={role}>{children}</GuardedShell>
    </Suspense>
  )
}

async function GuardedShell({
  role,
  children,
}: {
  role: DashboardRole
  children: ReactNode
}) {
  await requireDashboardRole(role)
  return <DashboardShell role={role}>{children}</DashboardShell>
}

function GuardFallback() {
  return (
    <div className="flex flex-1 items-center justify-center p-10">
      <p className="text-sm text-muted-foreground">Checking your access…</p>
    </div>
  )
}
