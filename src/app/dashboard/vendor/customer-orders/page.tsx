import { Suspense } from "react"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"

import { NoticeCard } from "@/components/notice-card"
import {
  OrderManager,
  type VendorOrder,
} from "@/components/vendor/order-manager"
import { apiFetch } from "@/lib/api-server"
import { auth } from "@/lib/auth"
import { BASE_API_URL } from "@/lib/base-url"

export const instant = false

const CustomerOrdersPage = () => {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Customer orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Accept or reject orders placed for your menu items.
        </p>
      </div>

      <Suspense fallback={<OrdersFallback />}>
        <Orders />
      </Suspense>
    </main>
  )
}

async function Orders() {
  const orders = await fetchOrders()

  if (!orders) {
    return (
      <NoticeCard
        title="Could not load orders"
        description="The order service is unavailable right now. Please try again later."
        action={{ label: "Try again", href: "/dashboard/vendor/customer-orders" }}
      />
    )
  }

  return <OrderManager orders={orders} onSetStatus={setOrderStatus} />
}

async function fetchOrders(): Promise<VendorOrder[] | null> {
  if (!BASE_API_URL) return null

  try {
    const response = await apiFetch("/orders", { withAuth: true })
    if (!response.ok) return null

    const payload = await response.json()
    if (!Array.isArray(payload)) return []

    return payload.flatMap((value) => {
      if (typeof value !== "object" || value === null) return []
      const order = value as Record<string, unknown>
      if (typeof order.id !== "string" || typeof order.itemId !== "string") return []

      const item = order.item as Record<string, unknown> | null | undefined
      const status = String(order.status ?? "pending")

      return [
        {
          id: order.id,
          itemId: order.itemId,
          customerId: String(order.customerId ?? ""),
          itemName: typeof item?.itemName === "string" ? item.itemName : "Menu item",
          deliveryDate: String(order.deliveryDate ?? "—"),
          deliveryAddress: String(order.deliveryAddress ?? "—"),
          message: typeof order.message === "string" ? order.message : undefined,
          status: (["pending", "accepted", "rejected", "cancelled"].includes(status)
            ? status
            : "pending") as VendorOrder["status"],
          createdAt: String(order.createdAt ?? ""),
        },
      ]
    })
  } catch {
    return null
  }
}

async function setOrderStatus(orderId: string, status: "accepted" | "rejected") {
  "use server"

  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user?.role !== "vendor") {
    return { ok: false, message: "Only vendors can manage orders." }
  }
  if (!BASE_API_URL) {
    return { ok: false, message: "The server is not configured." }
  }

  try {
    const response = await apiFetch(`/orders/${encodeURIComponent(orderId)}/status`, {
      method: "PATCH",
      body: { status },
      withAuth: true,
    })

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as {
        message?: string
      } | null
      return { ok: false, message: body?.message ?? "Could not update this order." }
    }

    revalidatePath("/dashboard/vendor/customer-orders")
    revalidatePath("/dashboard/vendor")
    return { ok: true, message: `Order ${status}.` }
  } catch {
    return { ok: false, message: "Could not reach the server." }
  }
}

function OrdersFallback() {
  return (
    <div className="grid gap-6 lg:grid-cols-2" aria-label="Loading orders">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="h-56 animate-pulse rounded-lg bg-muted" />
      ))}
    </div>
  )
}

export default CustomerOrdersPage
