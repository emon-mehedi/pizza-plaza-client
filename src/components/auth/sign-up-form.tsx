"use client"

import Link from "next/link"
import { useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FieldGroup } from "@/components/ui/field"
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
  const [role, setRole] = useState<SignUpRole>(DEFAULTS.role)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const user: IUser = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      image: String(formData.get("image") ?? ""),
      role,
      isBlocked: DEFAULTS.isBlocked,
      subscriptionPlan: DEFAULTS.subscriptionPlan,
      ...(role === "vendor"
        ? { businessName: String(formData.get("businessName") ?? "") }
        : {}),
      // subscriptionExpiresAt is intentionally omitted for new accounts.
    }

    // TODO: Replace with your real sign-up request / server action.
    if (onSubmit) {
      void onSubmit(user)
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
        <CardContent>
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
              label="Profile image URL"
              name="image"
              type="url"
              placeholder="https://example.com/avatar.png"
              description="A square image works best."
              autoComplete="url"
              required
            />

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
        </CardContent>

        <CardFooter className="flex-col items-stretch gap-3">
          <Button type="submit" size="lg" className="w-full">
            Create account
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
