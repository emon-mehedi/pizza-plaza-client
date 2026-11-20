import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"
import { ArrowRight, MapPin, Star } from "lucide-react"

import { NoticeCard } from "@/components/notice-card"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { apiFetch } from "@/lib/api-server"
import { BASE_API_URL } from "@/lib/base-url"
import { MENU_CATEGORIES } from "@/lib/menu-categories"

const CATEGORY_EMOJIS = ["🍕", "🥬", "🥓", "⭐", "🍟", "🍰"]

export default function Home() {
  return (
    <main className="flex-1">
      <section className="animate-in fade-in slide-in-from-bottom-4 bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 px-4 py-20 text-white duration-700">
        <div className="mx-auto max-w-5xl text-center">
          <p className="mb-4 text-sm font-medium tracking-widest uppercase opacity-90">
            Welcome to PizzaHub
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Fresh pizza, right to your door
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg opacity-90">
            Discover local vendors, explore their menus and order your favourite
            slices in a few clicks.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/menu"
              className={buttonVariants({ variant: "secondary", size: "lg" })}
            >
              Browse the menu <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/sign-up"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              Sell with PizzaHub
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="animate-in fade-in slide-in-from-bottom-4 mb-8 delay-150 duration-700 fill-mode-both">
          <h2 className="text-2xl font-semibold tracking-tight">Featured today</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            A taste of what our vendors are serving right now.
          </p>
        </div>

        <Suspense fallback={<FeaturedFallback />}>
          <FeaturedItems />
        </Suspense>
      </section>

      <section className="bg-muted/40 px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="animate-in fade-in slide-in-from-bottom-4 mb-8 delay-150 duration-700 fill-mode-both">
            <h2 className="text-2xl font-semibold tracking-tight">Explore by category</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Something for every craving.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MENU_CATEGORIES.map((category, index) => (
              <Link
                key={category}
                href={`/menu?category=${encodeURIComponent(category)}`}
                className="animate-in fade-in slide-in-from-bottom-4 group rounded-lg border bg-card p-5 transition-transform duration-700 hover:-translate-y-1 hover:shadow-md"
                style={{ animationDelay: `${index * 70}ms`, animationFillMode: "both" }}
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{CATEGORY_EMOJIS[index]}</span>
                  <div>
                    <p className="font-medium group-hover:text-orange-600">{category}</p>
                    <p className="text-xs text-muted-foreground">See matching items</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

async function FeaturedItems() {
  const items = await fetchFeaturedItems()

  if (items === null) {
    return (
      <NoticeCard
        title="Featured items unavailable"
        description="The menu service is taking a break. Browse the menu in a moment."
        action={{ label: "Browse menu", href: "/menu" }}
      />
    )
  }

  if (items.length === 0) {
    return (
      <NoticeCard
        title="Nothing featured yet"
        description="Vendors are adding their dishes. Check the full menu for what is available."
        action={{ label: "Browse menu", href: "/menu" }}
      />
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, index) => {
        const hasImage = /^https?:\/\//.test(item.images)

        return (
          <Card
            key={item.id}
            className="animate-in fade-in slide-in-from-bottom-4 overflow-hidden duration-700 transition-shadow hover:shadow-lg"
            style={{ animationDelay: `${index * 80}ms`, animationFillMode: "both" }}
          >
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
                <CardTitle className="text-lg">{item.itemName}</CardTitle>
                <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-700 dark:text-amber-400">
                  <Star className="size-3" /> Featured
                </span>
              </div>
              <CardDescription>{item.category}</CardDescription>
            </CardHeader>
            <CardContent className="line-clamp-2 text-sm text-muted-foreground">
              {item.description}
            </CardContent>
            <CardFooter className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3" /> {item.location}
              </span>
              <span className="font-semibold">${item.price.toFixed(2)}</span>
            </CardFooter>
            <CardFooter className="pt-0">
              <Link
                href={`/menu/${item.id}`}
                className={buttonVariants({ size: "sm", className: "w-full" })}
              >
                View item
              </Link>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}

type FeaturedItem = {
  id: string
  itemName: string
  category: string
  description: string
  price: number
  location: string
  images: string
}

async function fetchFeaturedItems(): Promise<FeaturedItem[] | null> {
  if (!BASE_API_URL) return null

  try {
    const response = await apiFetch("/items?featured=1&limit=6")
    if (!response.ok) return null

    const payload = await response.json()
    if (!Array.isArray(payload)) return []

    return payload.flatMap((value) => {
      if (typeof value !== "object" || value === null) return []
      const item = value as Record<string, unknown>
      if (
        typeof item.id !== "string" ||
        typeof item.itemName !== "string" ||
        typeof item.category !== "string" ||
        typeof item.price !== "number"
      ) {
        return []
      }

      return [
        {
          id: item.id,
          itemName: item.itemName,
          category: item.category,
          description: typeof item.description === "string" ? item.description : "",
          price: item.price,
          location: typeof item.location === "string" ? item.location : "",
          images: typeof item.images === "string" ? item.images : "",
        },
      ]
    })
  } catch {
    return null
  }
}

function FeaturedFallback() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading featured items">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-80 animate-pulse rounded-lg bg-muted" />
      ))}
    </div>
  )
}
