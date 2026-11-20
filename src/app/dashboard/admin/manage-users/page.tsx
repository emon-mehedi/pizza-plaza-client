import { Suspense } from "react"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"

import {
  UserManager,
  type AdminUser,
} from "@/components/admin/user-manager"
import { NoticeCard } from "@/components/notice-card"
import { apiFetch } from "@/lib/api-server"
import { auth } from "@/lib/auth"
import { BASE_API_URL } from "@/lib/base-url"

export const instant = false

const ManageUsersPage = () => {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Manage users</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Search registered users and block accounts that break the rules.
        </p>
      </div>

      <Suspense fallback={<UsersFallback />}>
        <Users />
      </Suspense>
    </main>
  )
}

async function Users() {
  const users = await fetchUsers()

  if (!users) {
    return (
      <NoticeCard
        title="Could not load users"
        description="The user service is unavailable right now. Please try again later."
        action={{ label: "Try again", href: "/dashboard/admin/manage-users" }}
      />
    )
  }

  return <UserManager users={users} onToggleBlock={setUserBlocked} />
}

async function fetchUsers(): Promise<AdminUser[] | null> {
  if (!BASE_API_URL) return null

  try {
    const response = await apiFetch("/users", { withAuth: true })
    if (!response.ok) return null
    return normalizeUsers(await response.json())
  } catch {
    return null
  }
}

// Server action used by the Block / Unblock buttons. It checks the admin role
// again here — hiding a button in the UI is not authorization.
async function setUserBlocked(userId: string, isBlocked: boolean) {
  "use server"

  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user?.role !== "admin") {
    return { ok: false, message: "Only admins can manage users." }
  }
  if (!BASE_API_URL) {
    return { ok: false, message: "The server is not configured." }
  }

  try {
    const response = await apiFetch(
      `/users/${encodeURIComponent(userId)}/block`,
      { method: "PATCH", body: { isBlocked }, withAuth: true }
    )

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as {
        message?: string
      } | null
      return { ok: false, message: body?.message ?? "Could not update the user." }
    }

    revalidatePath("/dashboard/admin/manage-users")
    return {
      ok: true,
      message: isBlocked ? "User blocked." : "User unblocked.",
    }
  } catch {
    return { ok: false, message: "Could not reach the server." }
  }
}

function normalizeUsers(payload: unknown): AdminUser[] {
  const list = Array.isArray(payload) ? payload : []

  return list.flatMap((value) => {
    if (typeof value !== "object" || value === null) return []

    const user = value as Record<string, unknown>
    if (
      typeof user.id !== "string" ||
      typeof user.name !== "string" ||
      typeof user.email !== "string"
    ) {
      return []
    }

    return [
      {
        id: user.id,
        name: user.name,
        email: user.email,
        image: typeof user.image === "string" ? user.image : null,
        role: (user.role === "admin" || user.role === "vendor"
          ? user.role
          : "customer") as AdminUser["role"],
        isBlocked: Boolean(user.isBlocked),
        businessName:
          typeof user.businessName === "string" ? user.businessName : undefined,
        subscriptionPlan:
          typeof user.subscriptionPlan === "string"
            ? user.subscriptionPlan
            : "free",
        createdAt:
          typeof user.createdAt === "string" ? user.createdAt : undefined,
      },
    ]
  })
}

function UsersFallback() {
  return (
    <div className="space-y-4" aria-label="Loading users">
      <div className="h-8 w-full animate-pulse rounded bg-muted" />
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-40 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  )
}

export default ManageUsersPage
