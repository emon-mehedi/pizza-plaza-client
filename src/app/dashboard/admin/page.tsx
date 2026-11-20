import { Suspense } from "react"
import { CreditCard, ClipboardList, Store, Users } from "lucide-react"

import { SimpleBarChart } from "@/components/dashboard/simple-bar-chart"
import { StatCard } from "@/components/dashboard/stat-card"
import { apiFetch } from "@/lib/api-server"
import { BASE_API_URL } from "@/lib/base-url"

export const instant = false

type AdminOverview = {
  totalUsers: number
  totalVendors: number
  totalCustomers: number
  totalItems: number
  pendingItems: number
  totalTransactions: number
}

const AdminDashboardPage = () => {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Admin overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A quick look at what is happening across PizzaHub.
        </p>
      </div>

      <Suspense fallback={<OverviewFallback />}>
        <Overview />
      </Suspense>
    </main>
  )
}

async function Overview() {
  const data = await fetchOverview()

  if (!data) {
    return (
      <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        Could not load the dashboard numbers. Please try again later.
      </p>
    )
  }

  const stats = [
    { title: "Registered users", value: data.totalUsers, icon: Users },
    { title: "Vendors", value: data.totalVendors, icon: Store },
    { title: "Customers", value: data.totalCustomers, icon: Users },
    { title: "Menu items", value: data.totalItems, icon: ClipboardList },
    { title: "Pending review", value: data.pendingItems, icon: ClipboardList },
    { title: "Transactions", value: data.totalTransactions, icon: CreditCard },
  ]

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
          />
        ))}
      </div>

      <SimpleBarChart
        title="At a glance"
        data={[
          { label: "Vendors", value: data.totalVendors, colorClassName: "bg-orange-500" },
          { label: "Customers", value: data.totalCustomers, colorClassName: "bg-amber-500" },
          { label: "Menu items", value: data.totalItems, colorClassName: "bg-red-500" },
          { label: "Pending review", value: data.pendingItems, colorClassName: "bg-yellow-500" },
        ]}
      />
    </div>
  )
}

async function fetchOverview(): Promise<AdminOverview | null> {
  if (!BASE_API_URL) return null

  try {
    const response = await apiFetch("/admin/overview", { withAuth: true })
    if (!response.ok) return null

    const payload = (await response.json()) as Record<string, unknown>
    const count = (key: string) => {
      const value = Number(payload[key])
      return Number.isFinite(value) ? value : 0
    }

    return {
      totalUsers: count("totalUsers"),
      totalVendors: count("totalVendors"),
      totalCustomers: count("totalCustomers"),
      totalItems: count("totalItems"),
      pendingItems: count("pendingItems"),
      totalTransactions: count("totalTransactions"),
    }
  } catch {
    return null
  }
}

function OverviewFallback() {
  return (
    <div className="space-y-6" aria-label="Loading admin overview">
      <div className="h-8 w-1/3 animate-pulse rounded bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  )
}

export default AdminDashboardPage
