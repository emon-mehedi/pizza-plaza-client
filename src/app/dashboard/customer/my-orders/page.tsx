import Image from "next/image"
import Link from "next/link"
import { headers } from "next/headers"
import { Suspense } from "react"

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
import { NoticeCard } from "@/components/notice-card"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { apiFetch } from "@/lib/api-server"
import { auth } from "@/lib/auth"
import { BASE_API_URL } from "@/lib/base-url"
import type { IOrders } from "@/lib/types/all-types"

type OrderRecord = IOrders & { _id?: string; item?: ItemRecord }
type ItemRecord = {
  _id?: string
  id?: string
  itemName: string
  images: string
  price?: number
}

const ORDER_STATUSES: IOrders["status"][] = [
  "pending",
  "accepted",
  "rejected",
  "cancelled",
]

const MyOrdersPage = () => {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Keep track of every order you have placed.
          </p>
        </div>
        <Link href="/menu" className={buttonVariants({ variant: "outline", size: "lg" })}>
          Browse menu
        </Link>
      </div>

      <Suspense fallback={<OrdersFallback />}>
        <CustomerOrders />
      </Suspense>
    </main>
  )
}

async function CustomerOrders() {
  const session = await auth.api.getSession({ headers: await headers() })
  const user = session?.user as { id?: string; role?: string } | undefined

  if (!user?.id || user.role !== "customer") {
    return (
      <NoticeCard
        title="Customer sign-in required"
        description="Sign in with a customer account to see your orders."
        action={{ label: "Sign in", href: "/sign-in" }}
      />
    )
  }

  // The API uses the JWT to decide which orders this customer may see.
  const [ordersPayload, itemsPayload] = await Promise.all([
    fetchJson("/orders", true),
    fetchJson("/items"),
  ])

  if (ordersPayload === null) {
    return (
      <NoticeCard
        title="Could not load your orders"
        description="The order service is unavailable right now. Please try again later."
        action={{ label: "Try again", href: "/dashboard/customer/my-orders" }}
      />
    )
  }

  const orders = normalizeOrders(ordersPayload).filter(
    (order) => order.customerId === user.id
  )

  if (orders.length === 0) {
    return (
      <NoticeCard
        title="No orders yet"
        description="Find something you like on the menu and place your first order."
        action={{ label: "Browse menu", href: "/menu" }}
      />
    )
  }

  const items = new Map(
    normalizeItems(itemsPayload).map((item) => [item._id ?? item.id ?? "", item])
  )

  return (
    <>
      <p className="mb-4 text-sm text-muted-foreground">
        {orders.length} {orders.length === 1 ? "order" : "orders"}
      </p>
      <div className="grid gap-6 lg:grid-cols-2">
        {orders.map((order) => {
          const item = order.item ?? items.get(order.itemId)

          return (
            <Card key={order._id ?? `${order.itemId}-${order.createdAt}`} className="h-full">
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle>{item?.itemName ?? "Menu item"}</CardTitle>
                    <CardDescription>Ordered {formatDate(order.createdAt)}</CardDescription>
                  </div>
                  <StatusBadge status={order.status} kind="order" />
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {item?.images && /^https?:\/\//.test(item.images) ? (
                      <Image
                        unoptimized
                        src={item.images}
                        alt={item.itemName}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center px-1 text-center text-xs text-muted-foreground">
                        No image
                      </div>
                    )}
                  </div>
                  <dl className="grid flex-1 gap-2 text-sm">
                    <div>
                      <dt className="text-muted-foreground">Delivery date</dt>
                      <dd className="font-medium">{formatDate(order.deliveryDate)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Deliver to</dt>
                      <dd className="font-medium">{order.deliveryAddress}</dd>
                    </div>
                    {typeof item?.price === "number" ? (
                      <div>
                        <dt className="text-muted-foreground">Price</dt>
                        <dd className="font-medium">${item.price.toFixed(2)}</dd>
                      </div>
                    ) : null}
                  </dl>
                </div>

                {order.message ? (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground">Your message</p>
                      <p className="mt-1 text-sm">{order.message}</p>
                    </div>
                  </>
                ) : null}
              </CardContent>

              <CardFooter className="mt-auto flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  Order ID: {order._id ?? "—"}
                </p>
                <Link
                  href={`/menu/${order.itemId}`}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  View item
                </Link>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </>
  )
}

async function fetchJson(path: string, withAuth = false): Promise<unknown | null> {
  if (!BASE_API_URL) return null

  try {
    const response = await apiFetch(path, { withAuth })
    return response.ok ? await response.json() : null
  } catch {
    return null
  }
}

function toArray(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload
  if (typeof payload !== "object" || payload === null) return []

  const root = payload as Record<string, unknown>
  const nested =
    typeof root.data === "object" && root.data !== null
      ? (root.data as Record<string, unknown>)
      : null

  if (Array.isArray(root.orders)) return root.orders
  if (Array.isArray(root.items)) return root.items
  if (Array.isArray(root.data)) return root.data
  if (nested && Array.isArray(nested.orders)) return nested.orders
  if (nested && Array.isArray(nested.items)) return nested.items

  return []
}

function normalizeItem(value: unknown): ItemRecord | undefined {
  if (typeof value !== "object" || value === null) return undefined

  const item = value as Record<string, unknown>
  if (
    typeof item.itemName !== "string" ||
    (typeof item._id !== "string" && typeof item.id !== "string")
  ) {
    return undefined
  }

  return {
    _id: typeof item._id === "string" ? item._id : undefined,
    id: typeof item.id === "string" ? item.id : undefined,
    itemName: item.itemName,
    images: typeof item.images === "string" ? item.images : "",
    price: typeof item.price === "number" ? item.price : undefined,
  }
}

function normalizeOrders(payload: unknown): OrderRecord[] {
  return toArray(payload).flatMap((value) => {
    if (typeof value !== "object" || value === null) return []

    const order = value as Record<string, unknown>
    if (
      typeof order.itemId !== "string" ||
      typeof order.customerId !== "string" ||
      typeof order.createdAt !== "string"
    ) {
      return []
    }

    return [
      {
        ...(order as unknown as IOrders),
        _id: typeof order._id === "string" ? order._id : undefined,
        vendorId: typeof order.vendorId === "string" ? order.vendorId : "",
        deliveryDate: typeof order.deliveryDate === "string" ? order.deliveryDate : "",
        deliveryAddress:
          typeof order.deliveryAddress === "string" ? order.deliveryAddress : "",
        message: typeof order.message === "string" ? order.message : "",
        status: ORDER_STATUSES.includes(order.status as IOrders["status"])
          ? (order.status as IOrders["status"])
          : "pending",
        item: normalizeItem(order.item),
      },
    ]
  })
}

function normalizeItems(payload: unknown): ItemRecord[] {
  return toArray(payload).flatMap((value) => {
    const item = normalizeItem(value)
    return item ? [item] : []
  })
}

function formatDate(value: string) {
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value
  const date = new Date(normalized)
  if (Number.isNaN(date.getTime())) return "—"

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function OrdersFallback() {
  return (
    <div className="grid gap-6 lg:grid-cols-2" aria-label="Loading orders">
      {Array.from({ length: 2 }).map((_, index) => (
        <Card key={index}>
          <CardHeader className="space-y-2">
            <div className="h-5 w-1/2 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/4 animate-pulse rounded bg-muted" />
          </CardHeader>
          <CardContent>
            <div className="h-20 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default MyOrdersPage
