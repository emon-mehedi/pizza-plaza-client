import Link from "next/link"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { Suspense } from "react"

import { NoticeCard } from "@/components/notice-card"
import {
  VendorItemList,
  type VendorItemValues,
} from "@/components/vendor/vendor-item-list"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import { auth } from "@/lib/auth"
import { apiFetch } from "@/lib/api-server"
import { BASE_API_URL } from "@/lib/base-url"
import { isMenuCategory } from "@/lib/menu-categories"
import type { IMenuItem } from "@/lib/types/all-types"

type MenuItemRecord = IMenuItem & { id?: string; _id?: string }

const MyMenuItemsPage = () => {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My menu items</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Edit, hide or remove the items you have added to your menu.
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
  const session = await auth.api.getSession({ headers: await headers() })
  const user = session?.user as { id?: string; role?: string } | undefined

  if (!user?.id || user.role !== "vendor") {
    return (
      <NoticeCard
        title="Vendor sign-in required"
        description="Sign in with a vendor account to see your menu items."
        action={{ label: "Sign in", href: "/sign-in" }}
      />
    )
  }

  const result = await fetchVendorItems()

  if (!result.ok) {
    return (
      <NoticeCard
        title="Could not load your items"
        description="The menu service is unavailable right now. Please try again later."
        action={{ label: "Try again", href: "/dashboard/vendor/my-menu-items" }}
      />
    )
  }

  const items = result.items
    .filter((item) => item.vendorId === user.id)
    .map((item) => ({
      id: item.id ?? item._id ?? "",
      itemName: item.itemName,
      category: item.category,
      description: item.description,
      price: item.price,
      location: item.location,
      images: item.images,
      status: item.status,
      createdAt: item.createdAt,
    }))
    .filter((item) => item.id)

  if (items.length === 0) {
    return (
      <NoticeCard
        title="No menu items yet"
        description="Add your first item and it will show up here."
        action={{ label: "Add menu item", href: "/dashboard/vendor/Add-menu-items" }}
      />
    )
  }

  return (
    <>
      <p className="mb-4 text-sm text-muted-foreground">
        {items.length} {items.length === 1 ? "item" : "items"}
      </p>
      <VendorItemList
        items={items}
        onUpdate={updateItem}
        onToggleAvailability={toggleAvailability}
        onDelete={deleteItem}
      />
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

async function requireVendor(): Promise<boolean> {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user?.role === "vendor"
}

async function updateItem(itemId: string, values: VendorItemValues) {
  "use server"

  if (!(await requireVendor())) {
    return { ok: false, message: "Only vendors can edit menu items." }
  }
  if (!isMenuCategory(values.category)) {
    return { ok: false, message: "Please choose a valid category." }
  }
  if (!BASE_API_URL) {
    return { ok: false, message: "The server is not configured." }
  }

  try {
    const response = await apiFetch(`/items/${encodeURIComponent(itemId)}`, {
      method: "PATCH",
      body: values,
      withAuth: true,
    })

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as {
        message?: string
      } | null
      return { ok: false, message: body?.message ?? "Could not update this item." }
    }

    revalidatePath("/dashboard/vendor/my-menu-items")
    revalidatePath("/menu")
    return { ok: true, message: "Menu item updated." }
  } catch {
    return { ok: false, message: "Could not reach the server." }
  }
}

async function toggleAvailability(itemId: string, isActive: boolean) {
  "use server"

  if (!(await requireVendor())) {
    return { ok: false, message: "Only vendors can manage menu items." }
  }
  if (!BASE_API_URL) {
    return { ok: false, message: "The server is not configured." }
  }

  try {
    const response = await apiFetch(
      `/items/${encodeURIComponent(itemId)}/availability`,
      { method: "PATCH", body: { isActive }, withAuth: true }
    )

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as {
        message?: string
      } | null
      return { ok: false, message: body?.message ?? "Could not update availability." }
    }

    revalidatePath("/dashboard/vendor/my-menu-items")
    revalidatePath("/menu")
    return { ok: true, message: isActive ? "Item is visible again." : "Item hidden." }
  } catch {
    return { ok: false, message: "Could not reach the server." }
  }
}

async function deleteItem(itemId: string) {
  "use server"

  if (!(await requireVendor())) {
    return { ok: false, message: "Only vendors can delete menu items." }
  }
  if (!BASE_API_URL) {
    return { ok: false, message: "The server is not configured." }
  }

  try {
    const response = await apiFetch(`/items/${encodeURIComponent(itemId)}`, {
      method: "DELETE",
      withAuth: true,
    })

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as {
        message?: string
      } | null
      return { ok: false, message: body?.message ?? "Could not delete this item." }
    }

    revalidatePath("/dashboard/vendor/my-menu-items")
    revalidatePath("/menu")
    return { ok: true, message: "Menu item deleted." }
  } catch {
    return { ok: false, message: "Could not reach the server." }
  }
}

function normalizeItems(payload: unknown): MenuItemRecord[] {
  const root =
    typeof payload === "object" && payload !== null
      ? (payload as Record<string, unknown>)
      : null
  const nested =
    typeof root?.data === "object" && root.data !== null
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
