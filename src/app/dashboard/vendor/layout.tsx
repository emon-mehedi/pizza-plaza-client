import type { ReactNode } from "react"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"

export default function VendorDashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardShell role="vendor">{children}</DashboardShell>
}
