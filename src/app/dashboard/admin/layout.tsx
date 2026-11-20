import type { ReactNode } from "react"

import { DashboardGuard } from "@/components/dashboard/dashboard-guard"

// The guard reads the session at request time.
export const instant = false

export default function AdminDashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardGuard role="admin">{children}</DashboardGuard>
}
