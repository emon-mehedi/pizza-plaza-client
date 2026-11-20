import Link from "next/link"
import { Suspense } from "react"
import { CheckCircle2, Clock3, Package, XCircle } from "lucide-react"

import { NoticeCard } from "@/components/notice-card"
import { SimpleBarChart } from "@/components/dashboard/simple-bar-chart"
import { StatCard } from "@/components/dashboard/stat-card"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { apiFetch } from "@/lib/api-server"
import { BASE_API_URL } from "@/lib/base-url"

export const instant = false

type CustomerOverview = {
  totalOrders: number
  pendingOrders: number
  acceptedOrders: number
  rejectedOrders: number
}

type RecentOrder = {
  id: string
  itemName: string
  status: string
  createdAt: string
}

const CustomerDashboardPage = () => {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Customer overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Follow your orders from placed to delivered.
          </p>
        </div>
        <Link href="/menu" className={buttonVariants({ variant: "outline" })}>
          Browse menu
        </Link>
      </div>

      <Suspense fallback={<OverviewFallback />}>
        <Overview />
      </Suspense>
    </main>
  )
}

async function Overview() {
  const [data, recent] = await Promise.all([
    fetchOverview(),
    fetchRecentOrders(),
  ])

  if (!data) {
    return (
      <NoticeCard
        title="Could not load your overview"
        description="The dashboard service is unavailable right now. Please try again later."
        action={{ label: "Try again", href: "/dashboard/customer" }}
      />
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total orders" value={data.totalOrders} icon={Package} />
        <StatCard title="Pending" value={data.pendingOrders} icon={Clock3} />
        <StatCard title="Accepted" value={data.acceptedOrders} icon={CheckCircle2} />
        <StatCard title="Rejected" value={data.rejectedOrders} icon={XCircle} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SimpleBarChart
          title="Your order statuses"
          data={[
            { label: "Pending", value: data.pendingOrders, colorClassName: "bg-amber-500" },
            { label: "Accepted", value: data.acceptedOrders, colorClassName: "bg-emerald-500" },
            { label: "Rejected", value: data.rejectedOrders, colorClassName: "bg-destructive" },
          ]}
        />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent orders</CardTitle>
            <CardDescription>Your latest activity at a glance</CardDescription>
          </CardHeader>
          <div className="space-y-3 px-6 pb-6">
            {recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders yet.</p>
            ) : (
              recent.map((order) => (
                <Link
                  key={order.id}
                  href={`/dashboard/customer/my-orders/${order.id}`}
                  className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm transition-colors hover:bg-muted"
                >
                  <span className="min-w-0 truncate">{order.itemName}</span>
                  <StatusBadge status={order.status} kind="order" />
                </Link>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

async function fetchOverview(): Promise<CustomerOverview | null> {
  if (!BASE_API_URL) return null

  try {
    const response = await apiFetch("/customer/overview", { withAuth: true })
    if (!response.ok) return null
    const payload = (await response.json()) as Record<string, unknown>
    const count = (key: string) => {
      const value = Number(payload[key])
      return Number.isFinite(value) ? value : 0
    }

    return {
      totalOrders: count("totalOrders"),
      pendingOrders: count("pendingOrders"),
      acceptedOrders: count("acceptedOrders"),
      rejectedOrders: count("rejectedOrders"),
    }
  } catch {
    return null
  }
}

async function fetchRecentOrders(): Promise<RecentOrder[]> {
  if (!BASE_API_URL) return []

  try {
    const response = await apiFetch("/orders", { withAuth: true })
    if (!response.ok) return []
    const payload = await response.json()
    if (!Array.isArray(payload)) return []

    return payload.slice(0, 3).flatMap((value) => {
      if (typeof value !== "object" || value === null) return []
      const order = value as Record<string, unknown>
      if (typeof order.id !== "string") return []
      const item = order.item as Record<string, unknown> | null | undefined

      return [
        {
          id: order.id,
          itemName: typeof item?.itemName === "string" ? item.itemName : "Menu item",
          status: String(order.status ?? "pending"),
          createdAt: String(order.createdAt ?? ""),
        },
      ]
    })
  } catch {
    return []
  }
}

function OverviewFallback() {
  return (
    <div className="space-y-6" aria-label="Loading customer overview">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-56 animate-pulse rounded-lg bg-muted" />
        <div className="h-56 animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  )
}

export default CustomerDashboardPage
