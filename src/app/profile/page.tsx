import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Suspense } from "react"

import { ProfileForm } from "@/components/profile/profile-form"
import { auth } from "@/lib/auth"

// The session is read at request time, so this route cannot be fully prerendered.
export const instant = false

export default function ProfileSettingsPage() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Profile settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage the personal details linked to your PizzaHub account.
        </p>
      </div>

      <Suspense fallback={<ProfileFallback />}>
        <ProfileContent />
      </Suspense>
    </main>
  )
}

async function ProfileContent() {
  const session = await auth.api.getSession({ headers: await headers() })
  const user = session?.user as
    | {
        id?: string
        name?: string | null
        email?: string | null
        image?: string | null
        role?: string | null
        businessName?: string | null
        subscriptionPlan?: string | null
        subscriptionExpiresAt?: string | null
      }
    | undefined

  if (!user?.id) {
    redirect("/sign-in")
  }

  return (
    <ProfileForm
      user={{
        name: user.name ?? "",
        email: user.email ?? "",
        image: user.image ?? "",
        role: user.role ?? "customer",
        businessName: user.businessName ?? null,
        subscriptionPlan: user.subscriptionPlan ?? "free",
        subscriptionExpiresAt: user.subscriptionExpiresAt ?? null,
      }}
    />
  )
}

function ProfileFallback() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="h-96 animate-pulse rounded-xl bg-muted" />
      <div className="h-64 animate-pulse rounded-xl bg-muted" />
    </div>
  )
}
