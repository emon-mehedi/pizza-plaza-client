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
import { MENU_CATEGORIES } from "@/lib/menu-categories"

export type AddMenuItemFormState = {
  status: "idle" | "success" | "error"
  message: string | null
  /** Incremented on success to remount (and reset) the fields. */
  key: number
}

type AddMenuItemFormProps = {
  action: (
    state: AddMenuItemFormState,
    formData: FormData
  ) => Promise<AddMenuItemFormState>
  initialState: AddMenuItemFormState
}

export function AddMenuItemForm({ action, initialState }: AddMenuItemFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState)

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle className="text-xl">Add a menu item</CardTitle>
        <CardDescription>
          Share a new dish with customers. Items are reviewed before they go live.
        </CardDescription>
      </CardHeader>

      <form action={formAction} key={state.key}>
        <CardContent className="space-y-4">
          <FieldGroup>
            <TextField
              label="Item name"
              name="itemName"
              type="text"
              placeholder="Margherita Pizza"
              required
            />
            <CategoryField />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="12.99"
                required
              />
              <TextField
                label="Location"
                name="location"
                type="text"
                placeholder="Downtown"
                required
              />
            </div>
            <TextField
              label="Image URL"
              name="images"
              type="url"
              placeholder="https://example.com/pizza.jpg"
              required
            />

            <DescriptionField />
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

        <CardFooter className="flex-col items-stretch gap-3">
          <Button type="submit" size="lg" className="w-full" disabled={pending}>
            {pending ? "Adding item..." : "Add menu item"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

function CategoryField() {
  const id = useId()

  return (
    <Field>
      <FieldLabel htmlFor={id}>Category</FieldLabel>
      <select
        id={id}
        name="category"
        defaultValue=""
        required
        className="h-8 w-full min-w-0 cursor-pointer rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30"
      >
        <option value="" disabled>
          Select a category
        </option>
        {MENU_CATEGORIES.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
    </Field>
  )
}

function DescriptionField() {
  const id = useId()

  return (
    <Field>
      <FieldLabel htmlFor={id}>Description</FieldLabel>
      <textarea
        id={id}
        name="description"
        rows={4}
        required
        placeholder="Describe the item, its ingredients, and what makes it special."
        className="w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
      />
    </Field>
  )
}
