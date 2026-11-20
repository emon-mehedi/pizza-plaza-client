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
import { auth } from "@/lib/auth"
import { apiFetch } from "@/lib/api-server"
import { BASE_API_URL } from "@/lib/base-url"
import type { IMenuItem } from "@/lib/types/all-types"

type MenuItemRecord = IMenuItem & { _id?: string }

const MyMenuItemsPage = () => {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My menu items</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every item you have added to your menu, all in one place.
          </p>
        </div>
        <Link
          href="/dashboard/vendor/Add-menu-items"
          className={buttonVariants({ size: "lg" })}
        >
          Add menu item
        </Link>
      </div>

      <Suspense fallback={<ItemsFallback />}>
        <VendorMenuItems />
      </Suspense>
    </main>
  )
}

async function VendorMenuItems() {
  // Session and backend URL are server-only, so this runs behind the Suspense boundary.
  const session = await auth.api.getSession({ headers: await headers() })
  const user = session?.user as { id?: string; role?: string } | undefined

  if (!user?.id || user.role !== "vendor") {
    return (
      <NoticeCard
        title="Vendor sign-in required"
        description="Sign in with a vendor account to see your menu items."
      />
    )
  }

  const result = await fetchVendorItems()

  if (!result.ok) {
    return (
      <NoticeCard
        title="Could not load your items"
        description="The menu service is unavailable right now. Please try again later."
      />
    )
  }

  const items = result.items.filter((item) => item.vendorId === user.id)

  if (items.length === 0) {
    return (
      <NoticeCard
        title="No menu items yet"
        description="Add your first item and it will show up here."
      />
    )
  }

  return (
    <>
      <p className="mb-4 text-sm text-muted-foreground">
        {items.length} {items.length === 1 ? "item" : "items"}
      </p>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <MenuItemCard key={item._id ?? `${item.itemName}-${item.createdAt}`} item={item} />
        ))}
      </div>
    </>
  )
}

async function fetchVendorItems(): Promise<
  { ok: true; items: MenuItemRecord[] } | { ok: false }
> {
  if (!BASE_API_URL) return { ok: false }

  try {
    const response = await apiFetch("/vendor/items", { withAuth: true })

    if (!response.ok) return { ok: false }

    return { ok: true, items: normalizeItems(await response.json()) }
  } catch {
    return { ok: false }
  }
}

function MenuItemCard({ item }: { item: MenuItemRecord }) {
  const hasImage = /^https?:\/\//.test(item.images)

  return (
    <Card className="h-full">
      {hasImage ? (
        <Image
          unoptimized
          src={item.images}
          alt={item.itemName}
          width={640}
          height={360}
          className="h-44 w-full bg-muted object-cover"
        />
      ) : (
        <div className="flex h-44 items-center justify-center bg-muted text-sm text-muted-foreground">
          No image available
        </div>
      )}

      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle>{item.itemName}</CardTitle>
          <span className={statusClassName(item.status)}>{item.status}</span>
        </div>
        <CardDescription>{item.category}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="line-clamp-3 text-sm text-muted-foreground">{item.description}</p>
        <Separator />
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-muted-foreground">Price</dt>
            <dd className="font-medium">${item.price.toFixed(2)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Location</dt>
            <dd className="font-medium">{item.location}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-muted-foreground">Added</dt>
            <dd className="font-medium">{formatDate(item.createdAt)}</dd>
          </div>
        </dl>
      </CardContent>

      <CardFooter className="mt-auto">
        <p className="text-xs text-muted-foreground">
          Item ID: {item._id ?? "—"}
        </p>
      </CardFooter>
    </Card>
  )
}

function statusClassName(status: IMenuItem["status"]) {
  const styles: Record<IMenuItem["status"], string> = {
    pending: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    approved: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    rejected: "bg-destructive/10 text-destructive",
    inactive: "bg-muted text-muted-foreground",
  }

  return `rounded-full px-2.5 py-1 text-xs font-medium capitalize ${styles[status]}`
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

function normalizeItems(payload: unknown): MenuItemRecord[] {
  const root = typeof payload === "object" && payload !== null
    ? (payload as Record<string, unknown>)
    : null
  const nested = typeof root?.data === "object" && root.data !== null
    ? (root.data as Record<string, unknown>)
    : null

  const list =
    asArray(payload) ??
    asArray(root?.items) ??
    asArray(root?.data) ??
    asArray(nested?.items) ??
    []

  return list.filter((item): item is MenuItemRecord => isMenuItemRecord(item))
}

const ITEM_STATUSES: IMenuItem["status"][] = [
  "pending",
  "approved",
  "rejected",
  "inactive",
]

function isMenuItemRecord(value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false

  const item = value as Record<string, unknown>

  return (
    typeof item.vendorId === "string" &&
    typeof item.itemName === "string" &&
    typeof item.category === "string" &&
    typeof item.description === "string" &&
    typeof item.price === "number" &&
    typeof item.location === "string" &&
    typeof item.images === "string" &&
    typeof item.createdAt === "string" &&
    typeof item.status === "string" &&
    ITEM_STATUSES.includes(item.status as IMenuItem["status"])
  )
}

function asArray(value: unknown): unknown[] | null {
  return Array.isArray(value) ? value : null
}

function NoticeCard({ title, description }: { title: string; description: string }) {
  return (
    <Card className="mx-auto w-full max-w-lg">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Link href="/dashboard/vendor/Add-menu-items" className={buttonVariants()}>
          Add menu item
        </Link>
      </CardFooter>
    </Card>
  )
}

function ItemsFallback() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3" aria-label="Loading menu items">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index}>
          <div className="h-44 animate-pulse bg-muted" />
          <CardHeader className="space-y-2">
            <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
          </CardHeader>
          <CardContent>
            <div className="h-16 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default MyMenuItemsPage
