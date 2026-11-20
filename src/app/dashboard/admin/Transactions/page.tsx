import { Suspense } from "react"

import { NoticeCard } from "@/components/notice-card"
import {
  TransactionList,
  type AdminTransaction,
} from "@/components/admin/transaction-list"
import { apiFetch } from "@/lib/api-server"
import { BASE_API_URL } from "@/lib/base-url"

export const instant = false

const TransactionsPage = () => {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A read-only record of every Premium payment on PizzaHub.
        </p>
      </div>

      <Suspense fallback={<TransactionsFallback />}>
        <Transactions />
      </Suspense>
    </main>
  )
}

async function Transactions() {
  const transactions = await fetchTransactions()

  if (!transactions) {
    return (
      <NoticeCard
        title="Could not load transactions"
        description="The payment service is unavailable right now. Please try again later."
        action={{ label: "Try again", href: "/dashboard/admin/Transactions" }}
      />
    )
  }

  return <TransactionList transactions={transactions} />
}

async function fetchTransactions(): Promise<AdminTransaction[] | null> {
  if (!BASE_API_URL) return null

  try {
    const response = await apiFetch("/transactions", { withAuth: true })
    if (!response.ok) return null
    return normalizeTransactions(await response.json())
  } catch {
    return null
  }
}

function normalizeTransactions(payload: unknown): AdminTransaction[] {
  const list = Array.isArray(payload) ? payload : []

  return list.flatMap((value) => {
    if (typeof value !== "object" || value === null) return []

    const row = value as Record<string, unknown>
    if (typeof row.id !== "string" || typeof row.amount !== "number") return []

    const rawVendor = row.vendor
    const vendor =
      typeof rawVendor === "object" && rawVendor !== null
        ? (rawVendor as Record<string, unknown>)
        : null

    return [
      {
        id: row.id,
        vendorId: typeof row.vendorId === "string" ? row.vendorId : "",
        vendor:
          vendor && typeof vendor.name === "string" && typeof vendor.email === "string"
            ? {
                name: vendor.name,
                email: vendor.email,
                businessName:
                  typeof vendor.businessName === "string" ? vendor.businessName : undefined,
              }
            : null,
        plan: typeof row.plan === "string" ? row.plan : "premium",
        amount: row.amount,
        currency: typeof row.currency === "string" ? row.currency : "usd",
        status: (["pending", "succeeded", "failed"].includes(String(row.status))
          ? row.status
          : "pending") as AdminTransaction["status"],
        stripeSessionId:
          typeof row.stripeSessionId === "string" ? row.stripeSessionId : "",
        createdAt: typeof row.createdAt === "string" ? row.createdAt : "",
      },
    ]
  })
}

function TransactionsFallback() {
  return (
    <div className="space-y-4" aria-label="Loading transactions">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-24 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-40 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  )
}

export default TransactionsPage
