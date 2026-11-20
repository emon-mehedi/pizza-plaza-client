"use client"

import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
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
import { MENU_CATEGORIES } from "@/lib/menu-categories"
import type { IMenuItem } from "@/lib/types/all-types"

export type MenuItemRecord = IMenuItem & { _id?: string; id?: string }

type SortOption = "newest" | "price_asc" | "price_desc"

export function MenuBrowser({ items }: { items: MenuItemRecord[] }) {
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get("category")

  const [query, setQuery] = useState("")
  const [categoryOverride, setCategoryOverride] = useState<string | null>(null)
  const [location, setLocation] = useState("all")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [sort, setSort] = useState<SortOption>("newest")

  const categories = useMemo(() => {
    const known = new Set<string>(MENU_CATEGORIES)
    const extra = Array.from(
      new Set(items.map((item) => item.category).filter((category) => !known.has(category)))
    ).sort()

    // Always show the full catalogue, including categories with no items yet.
    return [...MENU_CATEGORIES, ...extra]
  }, [items])
  const locations = useMemo(
    () => Array.from(new Set(items.map((item) => item.location))).sort(),
    [items]
  )

  // Category links on the home page pass ?category=.... A button click sets an
  // override so the user can still change the filter without editing the URL.
  const activeCategory =
    categoryOverride ??
    (categoryParam && categories.includes(categoryParam) ? categoryParam : "all")

  const visibleItems = useMemo(() => {
    const search = query.trim().toLowerCase()
    const min = minPrice === "" ? null : Number(minPrice)
    const max = maxPrice === "" ? null : Number(maxPrice)

    const filtered = items.filter((item) => {
      const matchesCategory =
        activeCategory === "all" || item.category === activeCategory
      const matchesLocation = location === "all" || item.location === location
      const matchesSearch =
        !search ||
        [item.itemName, item.category, item.description, item.location].some((value) =>
          value.toLowerCase().includes(search)
        )
      const matchesMin = min === null || !Number.isFinite(min) || item.price >= min
      const matchesMax = max === null || !Number.isFinite(max) || item.price <= max

      return matchesCategory && matchesLocation && matchesSearch && matchesMin && matchesMax
    })

    return [...filtered].sort((a, b) => {
      if (sort === "price_asc") return a.price - b.price
      if (sort === "price_desc") return b.price - a.price
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }, [items, query, activeCategory, location, minPrice, maxPrice, sort])

  function resetFilters() {
    setQuery("")
    setCategoryOverride("all")
    setLocation("all")
    setMinPrice("")
    setMaxPrice("")
    setSort("newest")
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="space-y-1 text-xs text-muted-foreground">
            Location
            <select
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
              aria-label="Filter by location"
            >
              <option value="all">All locations</option>
              {locations.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-xs text-muted-foreground">
            Minimum price
            <Input
              type="number"
              min="0"
              step="0.01"
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
              placeholder="0.00"
              aria-label="Minimum price"
            />
          </label>

          <label className="space-y-1 text-xs text-muted-foreground">
            Maximum price
            <Input
              type="number"
              min="0"
              step="0.01"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              placeholder="Any"
              aria-label="Maximum price"
            />
          </label>

          <label className="space-y-1 text-xs text-muted-foreground">
            Sort by
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortOption)}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
              aria-label="Sort menu items"
            >
              <option value="newest">Newest first</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
            </select>
          </label>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant={activeCategory === "all" ? "default" : "outline"}
          onClick={() => setCategoryOverride("all")}
        >
          All
        </Button>
        {categories.map((category) => (
          <Button
            key={category}
            type="button"
            size="sm"
            variant={activeCategory === category ? "default" : "outline"}
            onClick={() => setCategoryOverride(category)}
          >
            {category}
          </Button>
        ))}
        <Button type="button" size="sm" variant="ghost" onClick={resetFilters}>
          Reset filters
        </Button>
      </div>

      {visibleItems.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          No menu items match your filters.
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
  const itemId = item._id ?? item.id

  return (
    <Link href={`/menu/${itemId}`} className="block h-full">
      <Card className="group/card h-full overflow-hidden rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:ring-1 hover:ring-orange-500/30">
        <div className="relative">
          {hasImage ? (
            <Image
              unoptimized
              src={item.images}
              alt={item.itemName}
              width={640}
              height={360}
              className="h-64 w-full bg-muted object-cover transition-transform duration-500 group-hover/card:scale-105"
            />
          ) : (
            <div className="flex h-64 items-center justify-center bg-muted text-sm text-muted-foreground">
              No image available
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
          {item.category ? (
            <span className="absolute top-3 left-3 rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
              {item.category}
            </span>
          ) : null}
        </div>

        <CardHeader className="pb-2">
          <CardTitle className="text-lg leading-snug">{item.itemName}</CardTitle>
          <CardDescription>{item.location}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <p className="line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
          <Separator />
          <p className="text-xl font-semibold text-orange-700 dark:text-orange-400">
            ${item.price.toFixed(2)}
          </p>
        </CardContent>

        <CardFooter className="mt-auto">
          <p className="text-xs text-muted-foreground">
            Added {formatDate(item.createdAt)}
          </p>
        </CardFooter>
      </Card>
    </Link>
  )
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
