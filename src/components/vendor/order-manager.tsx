"use client"

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

type OrderStatus = "pending" | "accepted" | "rejected" | "cancelled"

export type VendorOrder = {
  id: string
  itemId: string
  customerId: string
  itemName: string
  deliveryDate: string
  deliveryAddress: string
  message?: string
  status: OrderStatus
  createdAt: string
}

type SetOrderStatus = (
  orderId: string,
  status: "accepted" | "rejected"
) => Promise<{ ok: boolean; message: string }>

export function OrderManager({
  orders,
  onSetStatus,
}: {
  orders: VendorOrder[]
  onSetStatus: SetOrderStatus
}) {
  const [status, setStatus] = useState<OrderStatus | "all">("pending")
  const [isPending, startTransition] = useTransition()

  const filtered = useMemo(
    () => orders.filter((order) => status === "all" || order.status === status),
    [orders, status]
  )

  function update(order: VendorOrder, nextStatus: "accepted" | "rejected") {
    startTransition(async () => {
      const result = await onSetStatus(order.id, nextStatus)
      if (result.ok) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2" aria-label="Filter orders by status">
        {(["pending", "accepted", "rejected", "cancelled", "all"] as const).map((value) => (
          <Button
            key={value}
            type="button"
            size="sm"
            variant={status === value ? "default" : "outline"}
            onClick={() => setStatus(value)}
          >
            {value === "all" ? "All" : value[0].toUpperCase() + value.slice(1)}
          </Button>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        Showing {filtered.length} of {orders.length} orders
      </p>

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          No orders in this view.
        </p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {filtered.map((order) => (
            <Card key={order.id} className="flex h-full flex-col">
              <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
                <div>
                  <CardTitle className="text-base">{order.itemName}</CardTitle>
                  <CardDescription>Ordered {formatDate(order.createdAt)}</CardDescription>
                </div>
                <StatusBadge status={order.status} kind="order" />
              </CardHeader>
              <CardContent className="flex-1 space-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">Deliver on: </span>
                  {order.deliveryDate}
                </p>
                <p>
                  <span className="text-muted-foreground">Address: </span>
                  {order.deliveryAddress}
                </p>
                {order.message ? (
                  <p className="rounded-md bg-muted p-3 text-sm">
                    “{order.message}”
                  </p>
                ) : null}
              </CardContent>
              <CardFooter className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  disabled={isPending || order.status !== "pending"}
                  onClick={() => update(order, "accepted")}
                >
                  Accept
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  disabled={isPending || order.status !== "pending"}
                  onClick={() => update(order, "rejected")}
                >
                  Reject
                </Button>
              </CardFooter>
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
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}
