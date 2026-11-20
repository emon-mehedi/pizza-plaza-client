"use client"

import Image from "next/image"
import { useState, useTransition, type FormEvent } from "react"
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
import { Input } from "@/components/ui/input"
import { MENU_CATEGORIES } from "@/lib/menu-categories"

type ItemStatus = "pending" | "approved" | "rejected" | "inactive"

export type VendorMenuItem = {
  id: string
  itemName: string
  category: string
  description: string
  price: number
  location: string
  images: string
  status: ItemStatus
  createdAt: string
}

export type VendorItemValues = Pick<
  VendorMenuItem,
  "itemName" | "category" | "description" | "price" | "location" | "images"
>

type UpdateItem = (
  itemId: string,
  values: VendorItemValues
) => Promise<{ ok: boolean; message: string }>
type ToggleAvailability = (
  itemId: string,
  isActive: boolean
) => Promise<{ ok: boolean; message: string }>
type DeleteItem = (itemId: string) => Promise<{ ok: boolean; message: string }>

export function VendorItemList({
  items,
  onUpdate,
  onToggleAvailability,
  onDelete,
}: {
  items: VendorMenuItem[]
  onUpdate: UpdateItem
  onToggleAvailability: ToggleAvailability
  onDelete: DeleteItem
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleEdit(event: FormEvent<HTMLFormElement>, item: VendorMenuItem) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const values: VendorItemValues = {
      itemName: String(form.get("itemName") ?? "").trim(),
      category: String(form.get("category") ?? ""),
      description: String(form.get("description") ?? "").trim(),
      price: Number(form.get("price")),
      location: String(form.get("location") ?? "").trim(),
      images: String(form.get("images") ?? "").trim(),
    }

    startTransition(async () => {
      const result = await onUpdate(item.id, values)
      if (result.ok) {
        toast.success(result.message)
        setEditingId(null)
      } else {
        toast.error(result.message)
      }
    })
  }

  function handleToggle(item: VendorMenuItem) {
    startTransition(async () => {
      const result = await onToggleAvailability(item.id, item.status !== "approved")
      if (result.ok) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    })
  }

  function handleDelete(item: VendorMenuItem) {
    if (confirmingDeleteId !== item.id) {
      setConfirmingDeleteId(item.id)
      return
    }

    startTransition(async () => {
      const result = await onDelete(item.id)
      if (result.ok) {
        toast.success(result.message)
        setConfirmingDeleteId(null)
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => {
        const hasImage = /^https?:\/\//.test(item.images)

        return (
          <Card key={item.id} className="flex h-full flex-col">
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
                <CardTitle className="text-base">{item.itemName}</CardTitle>
                <StatusBadge status={item.status} kind="item" />
              </div>
              <CardDescription>{item.category}</CardDescription>
            </CardHeader>

            {editingId === item.id ? (
              <CardContent>
                <form onSubmit={(event) => handleEdit(event, item)} className="space-y-3">
                  <Field label="Item name">
                    <Input name="itemName" defaultValue={item.itemName} required />
                  </Field>
                  <Field label="Category">
                    <select
                      name="category"
                      defaultValue={item.category}
                      required
                      className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                    >
                      {MENU_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Description">
                    <textarea
                      name="description"
                      defaultValue={item.description}
                      rows={3}
                      required
                      className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm"
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Price">
                      <Input
                        name="price"
                        type="number"
                        min="0"
                        step="0.01"
                        defaultValue={item.price}
                        required
                      />
                    </Field>
                    <Field label="Location">
                      <Input name="location" defaultValue={item.location} required />
                    </Field>
                  </div>
                  <Field label="Image URL">
                    <Input name="images" defaultValue={item.images} required />
                  </Field>
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" disabled={isPending}>
                      Save changes
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={isPending}
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            ) : (
              <CardContent className="flex-1 space-y-2 text-sm">
                <p className="line-clamp-3 text-muted-foreground">{item.description}</p>
                <p className="font-medium">${Number(item.price).toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">
                  {item.location} · Added {formatDate(item.createdAt)}
                </p>
              </CardContent>
            )}

            <CardFooter className="mt-auto flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={isPending}
                onClick={() => {
                  setEditingId(editingId === item.id ? null : item.id)
                  setConfirmingDeleteId(null)
                }}
              >
                Edit
              </Button>
              {["approved", "inactive"].includes(item.status) ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => handleToggle(item)}
                >
                  {item.status === "approved" ? "Hide" : "Show"}
                </Button>
              ) : null}
              <Button
                type="button"
                size="sm"
                variant="destructive"
                disabled={isPending}
                onClick={() => handleDelete(item)}
              >
                {confirmingDeleteId === item.id ? "Confirm delete" : "Delete"}
              </Button>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1 text-xs font-medium">
      <span className="text-muted-foreground">{label}</span>
      {children}
    </label>
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
