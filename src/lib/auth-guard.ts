import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import type { DashboardRole } from "@/lib/dashboard/navigation"

const HOME_BY_ROLE: Record<DashboardRole, string> = {
  admin: "/dashboard/admin",
  vendor: "/dashboard/vendor",
  customer: "/dashboard/customer",
}

/**
 * Server-side gate for dashboard routes.
 *
 * Call this from a Server Component. The role comes from the Better Auth
 * session in the database, never from the URL or a client-supplied value.
 * redirect() throws, so nothing below an unsuccessful check is rendered.
 */
export async function requireDashboardRole(role: DashboardRole) {
  const session = await auth.api.getSession({ headers: await headers() })
  const user = session?.user as
    | { id?: string; role?: string; isBlocked?: boolean }
    | undefined

  if (!user?.id) {
    redirect("/sign-in")
  }

  if (user.isBlocked) {
    redirect("/")
  }

  if (user.role !== role) {
    redirect(HOME_BY_ROLE[user.role as DashboardRole] ?? "/")
  }

  return user
}
