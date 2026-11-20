"use client"

import { useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

type CancelOrder = (
  orderId: string
) => Promise<{ ok: boolean; message: string }>

export function CancelOrderButton({
  orderId,
  onCancel,
}: {
  orderId: string
  onCancel: CancelOrder
}) {
  const [isPending, startTransition] = useTransition()

  return (
    <Button
      type="button"
      variant="destructive"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const result = await onCancel(orderId)
          if (result.ok) {
            toast.success(result.message)
          } else {
            toast.error(result.message)
          }
        })
      }
    >
      {isPending ? "Cancelling..." : "Cancel order"}
    </Button>
  )
}
