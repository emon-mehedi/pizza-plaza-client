"use client"

import Image from "next/image"
import { useMemo, useState, useTransition } from "react"
import { toast } from "sonner"

import { StatusBadge } from "@/components/dashboard/status-badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"

type ItemStatus = "pending" | "approved" | "rejected" | "inactive"

export type AdminMenuItem = {
  id: string
  vendorId: string
  itemName: string
  category: string
  description?: string
  price: number
  location?: string
  images?: string | string[] | null
  status: ItemStatus
  createdAt: string
  vendorName: string
}

type UpdateStatus = (
  itemId: string,
  status: ItemStatus
) => Promise<{ ok: boolean; message: string }>

const STATUS_FILTERS: Array<{ value: ItemStatus | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "inactive", label: "Hidden" },
]

export function MenuItemModerator({
  items,
  onUpdateStatus,
}: {
  items: AdminMenuItem[]
  onUpdateStatus: UpdateStatus
}) {
  const [status, setStatus] = useState<ItemStatus | "all">("pending")
  const [query, setQuery] = useState("")
  const [isPending, startTransition] = useTransition()

  const filteredItems = useMemo(() => {
    const search = query.trim().toLowerCase()

    return items.filter((item) => {
      const matchesStatus = status === "all" || item.status === status
      const matchesSearch =
        !search ||
        item.itemName.toLowerCase().includes(search) ||
        item.category.toLowerCase().includes(search) ||
        item.vendorName.toLowerCase().includes(search)

      return matchesStatus && matchesSearch
    })
  }, [items, status, query])

  function update(item: AdminMenuItem, nextStatus: ItemStatus) {
    startTransition(async () => {
      const result = await onUpdateStatus(item.id, nextStatus)
      if (result.ok) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search items, categories or vendors"
          aria-label="Search menu items"
          className="lg:max-w-sm"
        />
        <div className="flex flex-wrap gap-2" aria-label="Filter by status">
          {STATUS_FILTERS.map((filter) => (
            <Button
              key={filter.value}
              type="button"
              size="sm"
              variant={status === filter.value ? "default" : "outline"}
              onClick={() => setStatus(filter.value)}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Showing {filteredItems.length} of {items.length} submitted items
      </p>

      {filteredItems.length === 0 ? (
        <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          No items match this filter.
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((item) => {
            const image = Array.isArray(item.images) ? item.images[0] : item.images

            return (
              <Card key={item.id} className="flex h-full flex-col">
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle className="text-base">{item.itemName}</CardTitle>
                      <CardDescription>{item.category}</CardDescription>
                    </div>
                    <StatusBadge status={item.status} kind="item" />
                  </div>
                  {image ? (
                    <Image
                      src={image}
                      alt={item.itemName}
                      width={320}
                      height={160}
                      unoptimized
                      className="h-36 w-full rounded-md object-cover"
                    />
                  ) : null}
                </CardHeader>
                <CardContent className="flex-1 space-y-2 text-sm">
                  {item.description ? <p className="line-clamp-2">{item.description}</p> : null}
                  <p className="font-medium">${Number(item.price).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">
                    By {item.vendorName} · {formatDate(item.createdAt)}
                  </p>
                </CardContent>
                <CardFooter className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    disabled={isPending || item.status === "approved"}
                    onClick={() => update(item, "approved")}
                  >
                    Approve
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    disabled={isPending || item.status === "rejected"}
                    onClick={() => update(item, "rejected")}
                  >
                    Reject
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={isPending || item.status === "inactive"}
                    onClick={() => update(item, "inactive")}
                  >
                    Hide
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}
