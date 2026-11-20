"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, type ChangeEvent, type FormEvent } from "react"
import { toast } from "sonner"

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
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"
import { SIGNUP_SUCCESS_KEY } from "@/lib/signup-toast"
import type { IUser } from "@/lib/types/all-types"

import { RoleSelector, type SignUpRole } from "./role-selector"
import { TextField } from "./text-field"

/** Fields owned by the app rather than entered by the user. */
const DEFAULTS = {
  role: "customer",
  isBlocked: false,
  subscriptionPlan: "free",
} as const satisfies Pick<IUser, "role" | "isBlocked" | "subscriptionPlan">

type SignUpFormProps = {
  /** Receives a complete IUser payload when submission is wired up. */
  onSubmit?: (user: IUser) => void | Promise<void>
}

export function SignUpForm({ onSubmit }: SignUpFormProps) {
  const router = useRouter()
  const [role, setRole] = useState<SignUpRole>(DEFAULTS.role)
  const [imageUrl, setImageUrl] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setError(null)
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("image", file)

      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      })

      const data = (await response.json()) as { url?: string; error?: string }

      if (!response.ok || !data.url) {
        setError(data.error ?? "Image upload failed.")
        return
      }

      setImageUrl(data.url)
    } catch {
      setError("Image upload failed.")
    } finally {
      setIsUploading(false)
      event.target.value = ""
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const formData = new FormData(event.currentTarget)
    const password = String(formData.get("password") ?? "")
    const confirmPassword = String(formData.get("confirmPassword") ?? "")

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    if (!imageUrl) {
      setError("Please upload a profile picture.")
      return
    }

    const user: IUser = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      image: imageUrl,
      role,
      isBlocked: DEFAULTS.isBlocked,
      subscriptionPlan: DEFAULTS.subscriptionPlan,
      ...(role === "vendor"
        ? { businessName: String(formData.get("businessName") ?? "") }
        : {}),
      // subscriptionExpiresAt is intentionally omitted for new accounts.
    }

    if (onSubmit) {
      await onSubmit(user)
      return
    }

    setIsPending(true)
    const { error } = await authClient.signUp.email({
      name: user.name,
      email: user.email,
      password,
      image: user.image,
      role: user.role,
      ...(user.role === "vendor" && user.businessName
        ? { businessName: user.businessName }
        : {}),
      callbackURL: "/",
    } as Parameters<typeof authClient.signUp.email>[0])
    setIsPending(false)

    if (error) {
      setError(error.message ?? "Unable to create account.")
      return
    }

    sessionStorage.removeItem(SIGNUP_SUCCESS_KEY)
    toast.success("Account created successfully!")
    router.push("/")
    router.refresh()
  }

  async function handleGoogleSignUp() {
    setError(null)
    // The Google flow reloads the page, so persist the toast until we land on "/".
    sessionStorage.setItem(SIGNUP_SUCCESS_KEY, "1")

    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
    })

    if (error) {
      sessionStorage.removeItem(SIGNUP_SUCCESS_KEY)
      setError(error.message ?? "Unable to sign up with Google.")
    }
  }

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle className="text-xl">Create your account</CardTitle>
        <CardDescription>
          Join Pizza Plaza to order from local vendors or start selling yourself.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <FieldGroup>
            <TextField
              label="Full name"
              name="name"
              type="text"
              placeholder="Jane Doe"
              autoComplete="name"
              required
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              placeholder="jane@example.com"
              autoComplete="email"
              required
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              placeholder="Create a password"
              autoComplete="new-password"
              required
            />
            <TextField
              label="Confirm password"
              name="confirmPassword"
              type="password"
              placeholder="Re-enter your password"
              autoComplete="new-password"
              required
            />

            <Field>
              <FieldLabel htmlFor="profile-image-upload">Profile picture</FieldLabel>
              <Input
                id="profile-image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
              />
              {imageUrl ? (
                <p className="text-sm text-muted-foreground">Image uploaded.</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Please upload a profile picture to continue.
                </p>
              )}
            </Field>

            <RoleSelector value={role} onValueChange={setRole} />

            {role === "vendor" && (
              <TextField
                label="Business name"
                name="businessName"
                type="text"
                placeholder="Jane's Pizzeria"
                description="Shown to customers when they browse your menu."
                autoComplete="organization"
                required
              />
            )}
          </FieldGroup>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </CardContent>

        <CardFooter className="flex-col items-stretch gap-3">
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isPending || isUploading}
          >
            {isUploading
              ? "Uploading image..."
              : isPending
                ? "Creating account..."
                : "Create account"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            onClick={handleGoogleSignUp}
          >
            Sign up with Google
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
