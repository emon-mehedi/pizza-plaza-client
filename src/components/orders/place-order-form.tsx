"use client"

import { useActionState, useId } from "react"

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
  const today = new Date().toISOString().slice(0, 10)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Place an order</CardTitle>
        <CardDescription>
          Choose a delivery date and tell us where to bring your order.
        </CardDescription>
      </CardHeader>

      <form action={formAction} key={state.key}>
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
            {pending ? "Placing order..." : "Place order"}
          </Button>
        </CardFooter>
      </form>
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
