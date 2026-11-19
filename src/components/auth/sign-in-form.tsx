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
import { authClient } from "@/lib/auth-client"
import type { IUser } from "@/lib/types/all-types"

import { TextField } from "./text-field"

/** Credentials collected by the sign-in form. */
export type SignInCredentials = Pick<IUser, "email"> & {
  password: string
}

type SignInFormProps = {
  /** Receives the entered credentials when submission is wired up. */
  onSubmit?: (credentials: SignInCredentials) => void | Promise<void>
}

export function SignInForm({ onSubmit }: SignInFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const formData = new FormData(event.currentTarget)
    const credentials: SignInCredentials = {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    }

    if (onSubmit) {
      await onSubmit(credentials)
      return
    }

    setIsPending(true)
    const { error } = await authClient.signIn.email({
      email: credentials.email,
      password: credentials.password,
      callbackURL: "/",
    })
    setIsPending(false)

    if (error) {
      setError(error.message ?? "Unable to sign in.")
    }
  }

  async function handleGoogleSignIn() {
    setError(null)
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
    })
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-xl">Welcome back</CardTitle>
        <CardDescription>Sign in to continue to Pizza Plaza.</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <FieldGroup>
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
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </FieldGroup>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </CardContent>

        <CardFooter className="flex-col items-stretch gap-3">
          <Button type="submit" size="lg" className="w-full" disabled={isPending}>
            {isPending ? "Signing in..." : "Sign in"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            onClick={handleGoogleSignIn}
          >
            Continue with Google
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/sign-up"
              className="font-medium text-primary hover:underline"
            >
              Create one
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
