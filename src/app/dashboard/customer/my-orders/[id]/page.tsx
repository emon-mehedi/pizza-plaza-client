import Image from "next/image"
import Link from "next/link"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { Suspense } from "react"

import { NoticeCard } from "@/components/notice-card"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { CancelOrderButton } from "@/components/orders/cancel-order-button"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { apiFetch } from "@/lib/api-server"
import { auth } from "@/lib/auth"
import { BASE_API_URL } from "@/lib/base-url"

export const instant = false

type OrderStatus = "pending" | "accepted" | "rejected" | "cancelled"

type OrderDetail = {
  id: string
  itemId: string
  deliveryDate: string
  deliveryAddress: string
  message: string
  status: OrderStatus
  createdAt: string
  item: {
    itemName: string
    images?: string
    price?: number
    category?: string
    location?: string
  } | null
}

type OrderPageProps = {
  params: Promise<{ id: string }>
}

const OrderDetailPage = ({ params }: OrderPageProps) => {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <div className="mb-8">
        <Link
          href="/dashboard/customer/my-orders"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to my orders
        </Link>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">Order details</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Everything about this order in one place.
        </p>
      </div>

      <Suspense fallback={<DetailFallback />}>
        <OrderDetails params={params} />
      </Suspense>
    </main>
  )
}

async function OrderDetails({ params }: OrderPageProps) {
  const { id } = await params

  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user?.role !== "customer") {
    return (
      <NoticeCard
        title="Customer sign-in required"
        description="Sign in with a customer account to see your orders."
        action={{ label: "Sign in", href: "/sign-in" }}
      />
    )
  }

  const order = await fetchOrder(id)

  if (!order) {
    return (
      <NoticeCard
        title="Order not available"
        description="This order does not exist or belongs to another account."
        action={{ label: "Back to my orders", href: "/dashboard/customer/my-orders" }}
      />
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="text-xl">
            {order.item?.itemName ?? "Menu item"}
          </CardTitle>
          <CardDescription>
            Ordered {formatDate(order.createdAt)}
          </CardDescription>
        </div>
        <StatusBadge status={order.status} kind="order" />
      </CardHeader>

      <CardContent className="space-y-6">
        {order.item?.images && /^https?:\/\//.test(order.item.images) ? (
          <div className="relative h-56 w-full overflow-hidden rounded-lg bg-muted">
            <Image
              unoptimized
              src={order.item.images}
              alt={order.item.itemName}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </div>
        ) : null}

        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <Detail label="Delivery date" value={formatDate(order.deliveryDate)} />
          <Detail label="Deliver to" value={order.deliveryAddress} />
          <Detail
            label="Price"
            value={typeof order.item?.price === "number" ? `$${order.item.price.toFixed(2)}` : "—"}
          />
          <Detail label="Category" value={order.item?.category ?? "—"} />
          <Detail label="Location" value={order.item?.location ?? "—"} />
          <Detail label="Order ID" value={order.id} />
        </dl>

        <Separator />

        <div>
          <p className="text-sm text-muted-foreground">Your message</p>
          <p className="mt-1 text-sm">{order.message || "No message added."}</p>
        </div>
      </CardContent>

      <CardFooter className="flex flex-wrap gap-3">
        <Link
          href={`/menu/${order.itemId}`}
          className={buttonVariants({ variant: "outline" })}
        >
          View menu item
        </Link>
        {order.status === "pending" ? (
          <CancelOrderButton orderId={order.id} onCancel={cancelOrder} />
        ) : null}
      </CardFooter>
    </Card>
  )
}

async function fetchOrder(orderId: string): Promise<OrderDetail | null> {
  if (!BASE_API_URL) return null

  try {
    const response = await apiFetch(
      `/orders/${encodeURIComponent(orderId)}`,
      { withAuth: true }
    )
    if (!response.ok) return null
    return normalizeOrder(await response.json())
  } catch {
    return null
  }
}

async function cancelOrder(orderId: string) {
  "use server"

  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user?.role !== "customer") {
    return { ok: false, message: "Only customers can cancel their orders." }
  }
  if (!BASE_API_URL) {
    return { ok: false, message: "The server is not configured." }
  }

  try {
    const response = await apiFetch(
      `/orders/${encodeURIComponent(orderId)}/status`,
      { method: "PATCH", body: { status: "cancelled" }, withAuth: true }
    )

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as {
        message?: string
      } | null
      return { ok: false, message: body?.message ?? "Could not cancel this order." }
    }

    revalidatePath(`/dashboard/customer/my-orders/${orderId}`)
    revalidatePath("/dashboard/customer/my-orders")
    revalidatePath("/dashboard/customer")
    return { ok: true, message: "Order cancelled." }
  } catch {
    return { ok: false, message: "Could not reach the server." }
  }
}

function normalizeOrder(payload: unknown): OrderDetail | null {
  if (typeof payload !== "object" || payload === null) return null
  const order = payload as Record<string, unknown>
  if (typeof order.id !== "string" || typeof order.itemId !== "string") return null

  const rawItem = order.item
  const item = typeof rawItem === "object" && rawItem !== null
    ? (rawItem as Record<string, unknown>)
    : null
  const status = String(order.status ?? "pending")

  return {
    id: order.id,
    itemId: order.itemId,
    deliveryDate: String(order.deliveryDate ?? ""),
    deliveryAddress: String(order.deliveryAddress ?? ""),
    message: typeof order.message === "string" ? order.message : "",
    status: (["pending", "accepted", "rejected", "cancelled"].includes(status)
      ? status
      : "pending") as OrderStatus,
    createdAt: String(order.createdAt ?? ""),
    item: item && typeof item.itemName === "string"
      ? {
          itemName: item.itemName,
          images: typeof item.images === "string" ? item.images : undefined,
          price: typeof item.price === "number" ? item.price : undefined,
          category: typeof item.category === "string" ? item.category : undefined,
          location: typeof item.location === "string" ? item.location : undefined,
        }
      : null,
  }
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  )
}

function formatDate(value: string) {
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value
  const date = new Date(normalized)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function DetailFallback() {
  return (
    <div className="h-96 animate-pulse rounded-lg bg-muted" aria-label="Loading order" />
  )
}

export default OrderDetailPage
