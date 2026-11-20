"use client"

import {
  startTransition,
  useActionState,
  useId,
  useRef,
  useState,
  type FormEvent,
} from "react"
import { CreditCard } from "lucide-react"

import { TextField } from "@/components/auth/text-field"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"

export type PlaceOrderFormState = {
  status: "idle" | "success" | "error"
  message: string | null
  key: number
}

type PlaceOrderFormProps = {
  action: (
    state: PlaceOrderFormState,
    formData: FormData
  ) => Promise<PlaceOrderFormState>
  item: { id: string; name: string; price: number }
  initialState: PlaceOrderFormState
}

export function PlaceOrderForm({ action, item, initialState }: PlaceOrderFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [delivery, setDelivery] = useState({ date: "", address: "" })
  const formRef = useRef<HTMLFormElement>(null)
  const today = new Date().toISOString().slice(0, 10)

  function reviewPayment(form: HTMLFormElement) {
    const data = new FormData(form)
    setDelivery({
      date: String(data.get("deliveryDate") ?? ""),
      address: String(data.get("deliveryAddress") ?? ""),
    })
    setPaymentOpen(true)
  }

  function payWithDemo() {
    const form = formRef.current
    if (!form) return

    const data = new FormData(form)
    setPaymentOpen(false)
    startTransition(() => {
      formAction(data)
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Place an order</CardTitle>
        <CardDescription>
          Choose a delivery date and tell us where to bring your order.
        </CardDescription>
      </CardHeader>

      <form
        ref={formRef}
        key={state.key}
        onSubmit={(event: FormEvent<HTMLFormElement>) => {
          event.preventDefault()
          reviewPayment(event.currentTarget)
        }}
      >
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/50 p-3 text-sm">
            <p className="font-medium">{item.name}</p>
            <p className="text-muted-foreground">${item.price.toFixed(2)}</p>
          </div>
          <input type="hidden" name="itemId" value={item.id} readOnly />

          <FieldGroup>
            <TextField
              label="Delivery date"
              name="deliveryDate"
              type="date"
              min={today}
              required
            />
            <TextField
              label="Delivery address"
              name="deliveryAddress"
              type="text"
              placeholder="123 Main St, Apt 4"
              required
            />
            <MessageField />
          </FieldGroup>

          {state.message ? (
            <p
              aria-live="polite"
              className={
                state.status === "error"
                  ? "text-sm text-destructive"
                  : "text-sm text-emerald-600"
              }
            >
              {state.message}
            </p>
          ) : null}
        </CardContent>

        <CardFooter>
          <Button type="submit" size="lg" className="w-full" disabled={pending}>
            {pending ? "Placing order..." : "Continue to payment"}
          </Button>
        </CardFooter>
      </form>

      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pay for your order</DialogTitle>
            <DialogDescription>
              Review your order, then use the demo payment button below. No real charge will be made.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/50 p-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Delivery on {formatDeliveryDate(delivery.date)}
                  </p>
                </div>
                <p className="text-lg font-semibold">${item.price.toFixed(2)}</p>
              </div>
            </div>

            <div className="space-y-0.5 text-sm">
              <p className="font-medium">Deliver to</p>
              <p className="break-words text-muted-foreground">
                {delivery.address || "—"}
              </p>
            </div>

            <div className="rounded-lg border border-border p-3">
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <CreditCard className="size-5" aria-hidden="true" />
                </div>
                <div className="min-w-0 text-sm">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">Demo card</p>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-primary">
                      Demo
                    </span>
                  </div>
                  <p className="text-muted-foreground">•••• •••• •••• 4242</p>
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Simulated payment. No card details are collected and nothing is charged.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setPaymentOpen(false)}>
              Back
            </Button>
            <Button type="button" size="lg" disabled={pending} onClick={payWithDemo}>
              {pending
                ? "Processing demo payment..."
                : `Demo Pay $${item.price.toFixed(2)}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

function MessageField() {
  const id = useId()

  return (
    <Field>
      <FieldLabel htmlFor={id}>Message (optional)</FieldLabel>
      <textarea
        id={id}
        name="message"
        rows={3}
        placeholder="Any notes for the vendor?"
        className="w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
      />
    </Field>
  )
}

function formatDeliveryDate(value: string) {
  if (!value) return "your selected date"

  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}
