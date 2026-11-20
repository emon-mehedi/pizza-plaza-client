import type { ReactNode } from "react"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"

export default function CustomerDashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardShell role="customer">{children}</DashboardShell>
}
