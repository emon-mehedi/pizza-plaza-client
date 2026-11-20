import { Suspense } from "react"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"

import {
  MenuItemModerator,
  type AdminMenuItem,
} from "@/components/admin/menu-item-moderator"
import { NoticeCard } from "@/components/notice-card"
import { apiFetch } from "@/lib/api-server"
import { auth } from "@/lib/auth"
import { BASE_API_URL } from "@/lib/base-url"

export const instant = false

const VALID_STATUSES = ["pending", "approved", "rejected", "inactive"] as const
type ItemStatus = (typeof VALID_STATUSES)[number]

const ManageMenuItemsPage = () => {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Manage menu items</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review what vendors submit and approve, reject or hide items.
        </p>
      </div>

      <Suspense fallback={<ItemsFallback />}>
        <Items />
      </Suspense>
    </main>
  )
}

async function Items() {
  const [items, vendorNames] = await Promise.all([
    fetchItems(),
    fetchVendorNames(),
  ])

  if (!items) {
    return (
      <NoticeCard
        title="Could not load menu items"
        description="The menu service is unavailable right now. Please try again later."
        action={{ label: "Try again", href: "/dashboard/admin/manange-menu-items" }}
      />
    )
  }

  return (
    <MenuItemModerator
      items={items.map((item) => ({
        ...item,
        vendorName: vendorNames.get(item.vendorId) ?? "Unknown vendor",
      }))}
      onUpdateStatus={updateItemStatus}
    />
  )
}

async function fetchItems(): Promise<AdminMenuItem[] | null> {
  if (!BASE_API_URL) return null

  try {
    const response = await apiFetch("/admin/items", { withAuth: true })
    if (!response.ok) return null
    return normalizeItems(await response.json())
  } catch {
    return null
  }
}

async function fetchVendorNames(): Promise<Map<string, string>> {
  if (!BASE_API_URL) return new Map()

  try {
    const response = await apiFetch("/users?role=vendor", { withAuth: true })
    if (!response.ok) return new Map()

    const payload = await response.json()
    const names = new Map<string, string>()
    if (Array.isArray(payload)) {
      for (const value of payload) {
        if (typeof value !== "object" || value === null) continue
        const user = value as Record<string, unknown>
        if (typeof user.id === "string" && typeof user.name === "string") {
          names.set(user.id, user.name)
        }
      }
    }
    return names
  } catch {
    return new Map()
  }
}

async function updateItemStatus(itemId: string, status: ItemStatus) {
  "use server"

  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user?.role !== "admin") {
    return { ok: false, message: "Only admins can moderate menu items." }
  }
  if (!VALID_STATUSES.includes(status)) {
    return { ok: false, message: "Choose a valid status." }
  }
  if (!BASE_API_URL) {
    return { ok: false, message: "The server is not configured." }
  }

  try {
    const response = await apiFetch(`/items/${encodeURIComponent(itemId)}/status`, {
      method: "PATCH",
      body: { status },
      withAuth: true,
    })

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as {
        message?: string
      } | null
      return { ok: false, message: body?.message ?? "Could not update this item." }
    }

    revalidatePath("/dashboard/admin/manange-menu-items")
    return { ok: true, message: `Item marked as ${status}.` }
  } catch {
    return { ok: false, message: "Could not reach the server." }
  }
}

function normalizeItems(payload: unknown): AdminMenuItem[] {
  const list = Array.isArray(payload) ? payload : []

  return list.flatMap((value) => {
    if (typeof value !== "object" || value === null) return []

    const item = value as Record<string, unknown>
    if (
      typeof item.id !== "string" ||
      typeof item.itemName !== "string" ||
      typeof item.category !== "string" ||
      typeof item.status !== "string" ||
      !VALID_STATUSES.includes(item.status as ItemStatus)
    ) {
      return []
    }

    return [
      {
        id: item.id,
        itemName: item.itemName,
        category: item.category,
        description: typeof item.description === "string" ? item.description : undefined,
        price: Number(item.price) || 0,
        location: typeof item.location === "string" ? item.location : undefined,
        images: (item.images ?? null) as AdminMenuItem["images"],
        status: item.status as ItemStatus,
        createdAt: typeof item.createdAt === "string" ? item.createdAt : "",
        vendorId: typeof item.vendorId === "string" ? item.vendorId : "",
        vendorName: "Unknown vendor",
      },
    ]
  })
}

function ItemsFallback() {
  return (
    <div className="space-y-4" aria-label="Loading menu items">
      <div className="h-8 w-full animate-pulse rounded bg-muted" />
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-64 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  )
}

export default ManageMenuItemsPage
