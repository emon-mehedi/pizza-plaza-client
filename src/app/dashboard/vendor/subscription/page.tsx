import { Suspense } from "react"
import { headers } from "next/headers"
import { CheckCircle2, Crown } from "lucide-react"

import { NoticeCard } from "@/components/notice-card"
import { UpgradeButton } from "@/components/vendor/upgrade-button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { apiFetch } from "@/lib/api-server"
import { auth } from "@/lib/auth"
import { BASE_API_URL } from "@/lib/base-url"

export const instant = false

type PlanInfo = {
  isPremium: boolean
  subscriptionExpiresAt: string | null
}

const SubscriptionPage = () => {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Subscription</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose the plan that fits your menu.
        </p>
      </div>

      <Suspense fallback={<PlanFallback />}>
        <Plan />
      </Suspense>
    </main>
  )
}

async function Plan() {
  const info = await fetchPlanInfo()

  if (!info) {
    return (
      <NoticeCard
        title="Could not load your plan"
        description="The account service is unavailable right now. Please try again later."
        action={{ label: "Try again", href: "/dashboard/vendor/subscription" }}
      />
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Free</CardTitle>
          <CardDescription>For vendors just getting started</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-3xl font-semibold">$0</p>
          <p>Keep up to 3 active menu items.</p>
          <p>Receive and manage customer orders.</p>
        </CardContent>
        <CardFooter>
          {!info.isPremium ? (
            <p className="text-sm font-medium text-emerald-600">Your current plan</p>
          ) : null}
        </CardFooter>
      </Card>

      <Card className="border-orange-500/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              Premium <Crown className="size-5 text-orange-500" />
            </CardTitle>
            {info.isPremium ? (
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                Active
              </span>
            ) : null}
          </div>
          <CardDescription>For restaurants with a growing menu</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-3xl font-semibold">$9.99 <span className="text-base text-muted-foreground">/ year</span></p>
          <p className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-500" /> Unlimited menu items
          </p>
          <p className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-500" /> Featured placement on the home page
          </p>
          <p className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-500" /> All Free plan features
          </p>
          {info.isPremium && info.subscriptionExpiresAt ? (
            <p className="text-muted-foreground">
              Renews on {formatDate(info.subscriptionExpiresAt)}
            </p>
          ) : null}
        </CardContent>
        <CardFooter>
          {info.isPremium ? (
            <p className="text-sm text-muted-foreground">
              Your Premium plan is active. Enjoy!
            </p>
          ) : (
            <UpgradeButton onCheckout={startCheckout} />
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

async function fetchPlanInfo(): Promise<PlanInfo | null> {
  if (!BASE_API_URL) return null

  try {
    const response = await apiFetch("/vendor/overview", { withAuth: true })
    if (!response.ok) return null
    const payload = (await response.json()) as Record<string, unknown>

    return {
      isPremium: Boolean(payload.isPremium),
      subscriptionExpiresAt:
        typeof payload.subscriptionExpiresAt === "string"
          ? payload.subscriptionExpiresAt
          : null,
    }
  } catch {
    return null
  }
}

async function startCheckout() {
  "use server"

  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user?.role !== "vendor") {
    return { ok: false, message: "Sign in as a vendor to upgrade." }
  }
  if (!BASE_API_URL) {
    return { ok: false, message: "The server is not configured." }
  }

  try {
    const response = await apiFetch("/payments/checkout", {
      method: "POST",
      withAuth: true,
    })
    const body = (await response.json().catch(() => null)) as {
      url?: string
      message?: string
    } | null

    if (!response.ok || !body?.url) {
      return { ok: false, message: body?.message ?? "Could not start checkout." }
    }

    return { ok: true, url: body.url, message: "Opening secure checkout..." }
  } catch {
    return { ok: false, message: "Could not reach the payment server." }
  }
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function PlanFallback() {
  return (
    <div className="grid gap-6 md:grid-cols-2" aria-label="Loading subscription plans">
      {Array.from({ length: 2 }).map((_, index) => (
        <div key={index} className="h-80 animate-pulse rounded-lg bg-muted" />
      ))}
    </div>
  )
}

export default SubscriptionPage
