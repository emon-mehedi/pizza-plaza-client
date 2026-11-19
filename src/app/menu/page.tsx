import { Suspense } from "react"

import { MenuBrowser, type MenuItemRecord } from "@/components/menu/menu-browser"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { BASE_API_URL } from "@/lib/base-url"
import type { IMenuItem } from "@/lib/types/all-types"

const BrowseMenuPage = () => {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Browse the menu</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Explore all the dishes currently available across our vendors.
        </p>
      </div>

      <Suspense fallback={<ItemsFallback />}>
        <AllMenuItems />
      </Suspense>
    </main>
  )
}

async function AllMenuItems() {
  const result = await fetchAllItems()

  if (!result.ok) {
    return (
      <NoticeCard
        title="Menu unavailable"
        description="We couldn't load the menu right now. Please try again later."
      />
    )
  }

  if (result.items.length === 0) {
    return (
      <NoticeCard
        title="Nothing on the menu yet"
        description="Check back soon — vendors are adding their items."
      />
    )
  }

  return <MenuBrowser items={result.items} />
}

async function fetchAllItems(): Promise<
  { ok: true; items: MenuItemRecord[] } | { ok: false }
> {
  if (!BASE_API_URL) return { ok: false }

  try {
    const response = await fetch(`${BASE_API_URL}/items`)

    if (!response.ok) return { ok: false }

    return { ok: true, items: normalizeItems(await response.json()) }
  } catch {
    return { ok: false }
  }
}

const ITEM_STATUSES: IMenuItem["status"][] = [
  "pending",
  "approved",
  "rejected",
  "inactive",
]

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
    </Card>
  )
}

function ItemsFallback() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3" aria-label="Loading menu items">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index}>
          <div className="h-44 animate-pulse bg-muted" />
          <CardHeader className="space-y-2">
            <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}

export default BrowseMenuPage
