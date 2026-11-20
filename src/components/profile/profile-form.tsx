"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, type ChangeEvent, type FormEvent } from "react"
import { toast } from "sonner"

import { StatusBadge } from "@/components/dashboard/status-badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { TextField } from "@/components/auth/text-field"
import { updateUser } from "@/lib/auth-client"

export type ProfileUser = {
  name: string
  email: string
  image: string
  role: string
  businessName: string | null
  subscriptionPlan: string
  subscriptionExpiresAt: string | null
}

export function ProfileForm({ user }: { user: ProfileUser }) {
  const router = useRouter()
  const [imageUrl, setImageUrl] = useState(user.image)
  const [isUploading, setIsUploading] = useState(false)
  const [isPending, setIsPending] = useState(false)

  const dashboardHref =
    user.role === "admin"
      ? "/dashboard/admin"
      : user.role === "vendor"
        ? "/dashboard/vendor"
        : "/dashboard/customer"

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("image", file)

      const response = await fetch("/api/upload-image", { method: "POST", body: formData })
      const data = (await response.json()) as { url?: string; error?: string }

      if (!response.ok || !data.url) {
        toast.error(data.error ?? "Image upload failed.")
        return
      }

      setImageUrl(data.url)
      toast.success("Profile image uploaded. Save to apply the change.")
    } catch {
      toast.error("Image upload failed. Please try again.")
    } finally {
      setIsUploading(false)
      event.target.value = ""
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const name = String(formData.get("name") ?? "").trim()
    const businessName = String(formData.get("businessName") ?? "").trim()

    if (!name) {
      toast.error("Please enter your full name.")
      return
    }
    if (user.role === "vendor" && !businessName) {
      toast.error("Please enter your business name.")
      return
    }

    setIsPending(true)

    const { error } = await updateUser({
      name,
      ...(imageUrl !== user.image ? { image: imageUrl } : {}),
      ...(user.role === "vendor" ? { businessName } : {}),
    } as Parameters<typeof updateUser>[0])

    setIsPending(false)

    if (error) {
      toast.error(error.message ?? "Unable to update your profile.")
      return
    }

    toast.success("Profile updated successfully.")
    router.refresh()
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Profile settings</CardTitle>
          <CardDescription>
            Update the details shown across PizzaHub. Your role and subscription cannot be
            changed here.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <FieldGroup>
              <TextField
                label="Full name"
                name="name"
                defaultValue={user.name}
                placeholder="Jane Doe"
                autoComplete="name"
                required
              />

              <Field>
                <FieldLabel htmlFor="profile-email">Email</FieldLabel>
                <Input id="profile-email" value={user.email} disabled readOnly />
                <p className="text-xs text-muted-foreground">
                  Email changes are not available in profile settings.
                </p>
              </Field>

              <Field>
                <FieldLabel htmlFor="profile-image">Profile image</FieldLabel>
                <div className="flex flex-wrap items-center gap-4">
                  {imageUrl ? (
                    <Image
                      unoptimized
                      src={imageUrl}
                      alt={user.name}
                      width={64}
                      height={64}
                      className="size-16 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex size-16 items-center justify-center rounded-full bg-muted text-lg">
                      {user.name.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                  <Input
                    id="profile-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                    className="max-w-xs"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {isUploading
                    ? "Uploading image..."
                    : "Optional. Upload a new photo or keep your current one."}
                </p>
              </Field>

              {user.role === "vendor" ? (
                <TextField
                  label="Business name"
                  name="businessName"
                  defaultValue={user.businessName ?? ""}
                  placeholder="Jane's Pizzeria"
                  description="Shown to customers when they browse your menu."
                  autoComplete="organization"
                  required
                />
              ) : null}
            </FieldGroup>
          </CardContent>

          <CardFooter className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={isPending || isUploading}>
              {isPending ? "Saving..." : "Save changes"}
            </Button>
            <Link href={dashboardHref} className={buttonVariants({ variant: "ghost" })}>
              Back to dashboard
            </Link>
          </CardFooter>
        </form>
      </Card>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="text-lg">Account details</CardTitle>
          <CardDescription>Read-only information about your account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Role</span>
            <span className="capitalize">{user.role}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Plan</span>
            <StatusBadge status={user.subscriptionPlan} kind="plan" />
          </div>
          {user.subscriptionExpiresAt ? (
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Premium until</span>
              <span>{formatDate(user.subscriptionExpiresAt)}</span>
            </div>
          ) : null}
          {user.role === "vendor" && user.subscriptionPlan !== "premium" ? (
            <Link
              href="/dashboard/vendor/subscription"
              className={buttonVariants({ size: "sm", className: "w-full" })}
            >
              Upgrade to Premium
            </Link>
          ) : null}
        </CardContent>
      </Card>
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
