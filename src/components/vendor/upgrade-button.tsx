"use client"

import { useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

type Checkout = () => Promise<{
  ok: boolean
  url?: string
  message: string
}>

export function UpgradeButton({ onCheckout }: { onCheckout: Checkout }) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      const result = await onCheckout()

      if (!result.ok || !result.url) {
        toast.error(result.message)
        return
      }

      toast.success("Opening secure checkout...")
      window.location.assign(result.url)
    })
  }

  return (
    <Button type="button" size="lg" disabled={isPending} onClick={handleClick}>
      {isPending ? "Opening checkout..." : "Upgrade to Premium"}
    </Button>
  )
}
