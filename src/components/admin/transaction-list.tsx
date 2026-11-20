"use client"

import { CheckCircle2, Clock3, CreditCard, XCircle } from "lucide-react"
import { useMemo, useState } from "react"

import { StatCard } from "@/components/dashboard/stat-card"
import { StatusBadge } from "@/components/dashboard/status-badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"

type PaymentStatus = "pending" | "succeeded" | "failed"

export type AdminTransaction = {
  id: string
  vendorId: string
  vendor: { name: string; email: string; businessName?: string } | null
  plan: string
  amount: number
  currency: string
  status: PaymentStatus
  stripeSessionId: string
  createdAt: string
}

export function TransactionList({ transactions }: { transactions: AdminTransaction[] }) {
  const [status, setStatus] = useState<PaymentStatus | "all">("all")
  const [query, setQuery] = useState("")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase()

    return transactions.filter((row) => {
      const vendorText = [
        row.vendor?.name,
        row.vendor?.email,
        row.vendor?.businessName,
        row.stripeSessionId,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      if (status !== "all" && row.status !== status) return false
      if (search && !vendorText.includes(search)) return false
      if (from && row.createdAt.slice(0, 10) < from) return false
      if (to && row.createdAt.slice(0, 10) > to) return false
      return true
    })
  }, [transactions, status, query, from, to])

  const totalPaid = transactions
    .filter((row) => row.status === "succeeded")
    .reduce((sum, row) => sum + Number(row.amount), 0)

  const count = (value: PaymentStatus) =>
    transactions.filter((row) => row.status === value).length

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total received"
          value={`$${totalPaid.toFixed(2)}`}
          description="From successful payments"
          icon={CreditCard}
        />
        <StatCard title="Succeeded" value={count("succeeded")} icon={CheckCircle2} />
        <StatCard title="Pending" value={count("pending")} icon={Clock3} />
        <StatCard title="Failed" value={count("failed")} icon={XCircle} />
      </div>

      <div className="flex flex-col gap-3 rounded-lg border p-4">
        <div className="flex flex-col gap-3 lg:flex-row">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search vendor or session"
            aria-label="Search transactions"
            className="lg:max-w-sm"
          />
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as PaymentStatus | "all")}
            aria-label="Filter by payment status"
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm lg:w-44"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="succeeded">Succeeded</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <label className="flex items-center gap-2">
            <span className="text-muted-foreground">From</span>
            <Input
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              className="w-40"
              aria-label="From date"
            />
          </label>
          <label className="flex items-center gap-2">
            <span className="text-muted-foreground">To</span>
            <Input
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              className="w-40"
              aria-label="To date"
            />
          </label>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Showing {filtered.length} of {transactions.length} transactions
      </p>

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          No transactions match these filters.
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((row) => (
            <Card key={row.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
                <div>
                  <CardTitle className="text-base">
                    {row.vendor?.businessName ?? row.vendor?.name ?? "Deleted vendor"}
                  </CardTitle>
                  <CardDescription>{row.vendor?.email ?? "No email on record"}</CardDescription>
                </div>
                <StatusBadge status={row.status} kind="payment" />
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-medium">
                    {row.currency.toUpperCase()} {Number(row.amount).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="capitalize">{row.plan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span>{formatDate(row.createdAt)}</span>
                </div>
                <p className="truncate pt-1 text-xs text-muted-foreground">
                  Session: {row.stripeSessionId}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}
