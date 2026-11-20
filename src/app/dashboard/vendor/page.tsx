import Link from "next/link"
import { Suspense } from "react"
import { ClipboardList, Clock3, PackageCheck, Store } from "lucide-react"

import { NoticeCard } from "@/components/notice-card"
import { SimpleBarChart } from "@/components/dashboard/simple-bar-chart"
import { StatCard } from "@/components/dashboard/stat-card"
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

type VendorOverview = {
  totalMenuItems: number
  activeMenuItems: number
  pendingOrders: number
  acceptedOrders: number
  subscriptionPlan: string
  isPremium: boolean
}

type OrderSnapshot = {
  id: string
  itemName: string
  deliveryDate: string
  deliveryAddress: string
  status: string
  createdAt: string
}

const VendorDashboardPage = () => {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Vendor overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your menu, your orders and your current plan at a glance.
          </p>
        </div>
        <Link
          href="/dashboard/vendor/customer-orders"
          className={buttonVariants({ variant: "outline" })}
        >
          View all orders
        </Link>
      </div>

      <Suspense fallback={<OverviewFallback />}>
        <Overview />
      </Suspense>
    </main>
  )
}

async function Overview() {
  const data = await fetchOverview()
  const pendingOrders = await fetchPendingOrders()

  if (!data) {
    return (
      <NoticeCard
        title="Could not load your overview"
        description="The dashboard service is unavailable right now. Please try again later."
        action={{ label: "Try again", href: "/dashboard/vendor" }}
      />
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Menu items" value={data.totalMenuItems} icon={Store} />
        <StatCard title="Published items" value={data.activeMenuItems} icon={ClipboardList} />
        <StatCard title="Pending orders" value={data.pendingOrders} icon={Clock3} />
        <StatCard title="Accepted orders" value={data.acceptedOrders} icon={PackageCheck} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SimpleBarChart
          title="Your activity"
          data={[
            { label: "Published items", value: data.activeMenuItems, colorClassName: "bg-emerald-500" },
            { label: "Pending orders", value: data.pendingOrders, colorClassName: "bg-amber-500" },
            { label: "Accepted orders", value: data.acceptedOrders, colorClassName: "bg-orange-500" },
          ]}
        />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {data.isPremium ? "Premium plan is active" : "Free plan"}
            </CardTitle>
            <CardDescription>
              {data.isPremium
                ? "You can add as many menu items as you like."
                : "Free vendors can keep up to 3 active items."}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Recent pending orders</h2>
        {pendingOrders.length === 0 ? (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            No orders waiting for you right now.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {pendingOrders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <CardTitle className="text-base">{order.itemName}</CardTitle>
                  <CardDescription>
                    Deliver on {order.deliveryDate} · {order.deliveryAddress}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

async function fetchOverview(): Promise<VendorOverview | null> {
  if (!BASE_API_URL) return null

  try {
    const response = await apiFetch("/vendor/overview", { withAuth: true })
    if (!response.ok) return null
    const payload = (await response.json()) as Record<string, unknown>
    const count = (key: string) => {
      const value = Number(payload[key])
      return Number.isFinite(value) ? value : 0
    }

    return {
      totalMenuItems: count("totalMenuItems"),
      activeMenuItems: count("activeMenuItems"),
      pendingOrders: count("pendingOrders"),
      acceptedOrders: count("acceptedOrders"),
      subscriptionPlan: String(payload.subscriptionPlan ?? "free"),
      isPremium: Boolean(payload.isPremium),
    }
  } catch {
    return null
  }
}

async function fetchPendingOrders(): Promise<OrderSnapshot[]> {
  if (!BASE_API_URL) return []

  try {
    const response = await apiFetch("/orders?status=pending", { withAuth: true })
    if (!response.ok) return []

    const payload = await response.json()
    if (!Array.isArray(payload)) return []

    return payload.flatMap((value) => {
      if (typeof value !== "object" || value === null) return []
      const order = value as Record<string, unknown>
      if (typeof order.id !== "string") return []
      const item = order.item as Record<string, unknown> | null | undefined

      return [
        {
          id: order.id,
          itemName: typeof item?.itemName === "string" ? item.itemName : "Menu item",
          deliveryDate: String(order.deliveryDate ?? "—"),
          deliveryAddress: String(order.deliveryAddress ?? "—"),
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
    <div className="space-y-6" aria-label="Loading vendor overview">
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

export default VendorDashboardPage
