"use client"

import Image from "next/image"
import { useMemo, useState } from "react"

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
import { Separator } from "@/components/ui/separator"
import type { IMenuItem } from "@/lib/types/all-types"

export type MenuItemRecord = IMenuItem & { _id?: string }

export function MenuBrowser({ items }: { items: MenuItemRecord[] }) {
  const [query, setQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")

  const categories = useMemo(
    () => Array.from(new Set(items.map((item) => item.category))).sort(),
    [items]
  )

  const search = query.trim().toLowerCase()
  const visibleItems = items.filter((item) => {
    const matchesCategory =
      activeCategory === "all" || item.category === activeCategory
    const matchesSearch =
      !search ||
      [item.itemName, item.category, item.description, item.location].some((value) =>
        value.toLowerCase().includes(search)
      )

    return matchesCategory && matchesSearch
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name, category, or location"
          aria-label="Search menu items"
          className="sm:max-w-sm"
        />
        <p className="text-sm text-muted-foreground">
          Showing {visibleItems.length} of {items.length} items
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant={activeCategory === "all" ? "default" : "outline"}
          onClick={() => setActiveCategory("all")}
        >
          All
        </Button>
        {categories.map((category) => (
          <Button
            key={category}
            type="button"
            size="sm"
            variant={activeCategory === category ? "default" : "outline"}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      {visibleItems.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          No menu items match your search.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {visibleItems.map((item) => (
            <MenuItemCard key={item._id ?? `${item.itemName}-${item.createdAt}`} item={item} />
          ))}
        </div>
      )}
    </div>
  )
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
        </dl>
      </CardContent>

      <CardFooter className="mt-auto">
        <p className="text-xs text-muted-foreground">
          Added {formatDate(item.createdAt)}
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
