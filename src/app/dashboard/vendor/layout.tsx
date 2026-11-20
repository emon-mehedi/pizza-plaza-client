import type { ReactNode } from "react"

import { DashboardGuard } from "@/components/dashboard/dashboard-guard"

// The guard reads the session at request time.
export const instant = false

export default function VendorDashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardGuard role="vendor">{children}</DashboardGuard>
}
