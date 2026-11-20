import Image from "next/image"
import Link from "next/link"
import { headers } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { Suspense } from "react"

import {
  PlaceOrderForm,
  type PlaceOrderFormState,
} from "@/components/orders/place-order-form"
import { NoticeCard } from "@/components/notice-card"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { apiFetch } from "@/lib/api-server"
import { auth } from "@/lib/auth"
import { BASE_API_URL } from "@/lib/base-url"
import type { IMenuItem, IOrders } from "@/lib/types/all-types"

// The shared navbar reads the URL, which is only available at request time.
export const instant = false

type MenuItemRecord = IMenuItem & { _id?: string; id?: string }

const INITIAL_STATE: PlaceOrderFormState = { status: "idle", message: null, key: 0 }

const ItemDetailsPage = ({ params }: PageProps<"/menu/[id]">) => {
  async function placeOrder(
    prevState: PlaceOrderFormState,
    formData: FormData
  ): Promise<PlaceOrderFormState> {
    "use server"

    const session = await auth.api.getSession({ headers: await headers() })
    const user = session?.user as { id?: string; role?: string } | undefined

    if (!user?.id || user.role !== "customer") {
      return failure("Sign in as a customer to place an order.", prevState)
    }

    if (!BASE_API_URL) {
      return failure("The order service is not configured.", prevState)
    }

    const itemId = String(formData.get("itemId") ?? "").trim()
    const deliveryDate = String(formData.get("deliveryDate") ?? "").trim()
    const deliveryAddress = String(formData.get("deliveryAddress") ?? "").trim()
    const message = String(formData.get("message") ?? "").trim()

    if (!deliveryAddress || !deliveryDate || Number.isNaN(Date.parse(deliveryDate))) {
      return failure("Please provide a valid delivery date and address.", prevState)
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (new Date(deliveryDate).getTime() < today.getTime()) {
      return failure("Please choose today or a future delivery date.", prevState)
    }

    const itemResult = await fetchItem(itemId)
    if (!itemResult.ok) {
      return failure(
        itemResult.reason === "not-found"
          ? "This item is no longer available."
          : "Could not verify the item. Please try again.",
        prevState
      )
    }

    const item = itemResult.item

    // The API only serves approved items, but check again here so a stale form
    // cannot slip through if an item is hidden while the page is open.
    if (item.status !== "approved") {
      return failure("This item is no longer available.", prevState)
    }
    if (item.vendorId === user.id) {
      return failure("You cannot order an item from your own restaurant.", prevState)
    }

    const order: IOrders = {
      itemId: item._id ?? item.id ?? itemId,
      vendorId: item.vendorId,
      customerId: user.id,
      deliveryDate,
      deliveryAddress,
      message,
      status: "pending",
      createdAt: new Date().toISOString(),
    }

    try {
      const response = await apiFetch("/orders", {
        method: "POST",
        body: order,
        withAuth: true,
      })

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as { message?: string } | null
        return failure(errorBody?.message ?? "Could not place your order. Please try again.", prevState)
      }
    } catch {
      return failure("Could not reach the order service. Please try again.", prevState)
    }

    // redirect() throws internally, so it must stay outside the try/catch above.
    redirect("/menu")
  }

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10">
      <Suspense fallback={<DetailsFallback />}>
        <ItemDetails params={params} placeOrder={placeOrder} />
      </Suspense>
    </main>
  )
}

async function ItemDetails({
  params,
  placeOrder,
}: {
  params: Promise<{ id: string }>
  placeOrder: (
    state: PlaceOrderFormState,
    formData: FormData
  ) => Promise<PlaceOrderFormState>
}) {
  const { id } = await params
  const result = await fetchItem(id)

  if (!result.ok) {
    if (result.reason === "not-found") notFound()

    return (
      <NoticeCard
        title="Item unavailable"
        description="We couldn't load this item right now. Please try again later."
      />
    )
  }

  const item = result.item

  const session = await auth.api.getSession({ headers: await headers() })
  const user = session?.user as { id?: string; role?: string } | undefined
  const canOrder = Boolean(user?.id && user.role === "customer")
  const isOwnItem = Boolean(user?.id && item.vendorId === user.id)

  const itemId = item._id ?? item.id ?? id

  return (
    <>
      <Link
        href="/menu"
        className={buttonVariants({ variant: "ghost", size: "sm", className: "mb-6 -ml-2" })}
      >
        ← Back to menu
      </Link>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <Card className="overflow-hidden">
          {/^https?:\/\//.test(item.images) ? (
            <Image
              unoptimized
              src={item.images}
              alt={item.itemName}
              width={1200}
              height={675}
              className="h-72 w-full bg-muted object-cover sm:h-96"
            />
          ) : (
            <div className="flex h-72 items-center justify-center bg-muted text-sm text-muted-foreground sm:h-96">
              No image available
            </div>
          )}

          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle className="text-2xl">{item.itemName}</CardTitle>
                <CardDescription>{item.category}</CardDescription>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium capitalize text-primary">
                {item.status}
              </span>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            <p className="leading-relaxed text-muted-foreground">{item.description}</p>
            <Separator />
            <dl className="grid gap-4 sm:grid-cols-2">
              <Detail label="Price" value={`$${item.price.toFixed(2)}`} />
              <Detail label="Location" value={item.location} />
              <Detail label="Added" value={formatDate(item.createdAt)} />
              <Detail label="Item ID" value={itemId} />
            </dl>
          </CardContent>
        </Card>

        {canOrder ? (
          <PlaceOrderForm
            action={placeOrder}
            item={{ id: itemId, name: item.itemName, price: item.price }}
            initialState={INITIAL_STATE}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                {isOwnItem ? "This is your item" : "Ready to order?"}
              </CardTitle>
              <CardDescription>
                {isOwnItem
                  ? "Vendors cannot order their own menu items. You can manage it from your dashboard."
                  : "Sign in with a customer account to place an order for this item."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href={isOwnItem ? "/dashboard/vendor/my-menu-items" : "/sign-in"}
                className={buttonVariants({ size: "lg", className: "w-full" })}
              >
                {isOwnItem ? "Manage this item" : "Sign in to order"}
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 break-all font-medium">{value}</dd>
    </div>
  )
}

function failure(message: string, state: PlaceOrderFormState): PlaceOrderFormState {
  return { status: "error", message, key: state.key }
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

type FetchItemResult =
  | { ok: true; item: MenuItemRecord }
  | { ok: false; reason: "not-found" | "error" }

async function fetchItem(id: string): Promise<FetchItemResult> {
  if (!BASE_API_URL) return { ok: false, reason: "error" }

  try {
    const response = await apiFetch(`/items/${encodeURIComponent(id)}`)

    if (response.status === 404) return { ok: false, reason: "not-found" }
    if (!response.ok) return { ok: false, reason: "error" }

    const payload: unknown = await response.json()
    const root =
      typeof payload === "object" && payload !== null
        ? (payload as Record<string, unknown>)
        : null
    const nested =
      typeof root?.data === "object" && root.data !== null
        ? (root.data as Record<string, unknown>)
        : null

    const item = [payload, root?.item, root?.data, nested?.item].find(isMenuItemRecord)

    return item
      ? { ok: true, item }
      : { ok: false, reason: "error" }
  } catch {
    return { ok: false, reason: "error" }
  }
}

function isMenuItemRecord(value: unknown): value is MenuItemRecord {
  if (typeof value !== "object" || value === null) return false

  const item = value as Record<string, unknown>

  return (
    (typeof item._id === "string" || typeof item.id === "string") &&
    typeof item.vendorId === "string" &&
    typeof item.itemName === "string" &&
    typeof item.category === "string" &&
    typeof item.description === "string" &&
    typeof item.price === "number" &&
    typeof item.location === "string" &&
    typeof item.images === "string" &&
    typeof item.createdAt === "string" &&
    item.status === "approved"
  )
}

function DetailsFallback() {
  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
      <Card>
        <div className="h-72 animate-pulse bg-muted sm:h-96" />
        <CardHeader className="space-y-2">
          <div className="h-6 w-1/2 animate-pulse rounded bg-muted" />
          <div className="h-4 w-1/4 animate-pulse rounded bg-muted" />
        </CardHeader>
        <CardContent>
          <div className="h-20 animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="space-y-2">
          <div className="h-6 w-2/3 animate-pulse rounded bg-muted" />
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
        </CardHeader>
        <CardContent>
          <div className="h-40 animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
    </div>
  )
}

export default ItemDetailsPage
