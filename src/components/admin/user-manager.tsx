"use client"

import Image from "next/image"
import { useMemo, useState, useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "cn"

export type AdminUser = {
  id: string
  name: string
  email: string
  image?: string | null
  role: "vendor" | "customer" | "admin"
  isBlocked: boolean
  businessName?: string
  subscriptionPlan?: string
  createdAt?: string
}

type ToggleBlock = (
  userId: string,
  isBlocked: boolean
) => Promise<{ ok: boolean; message: string }>

export function UserManager({
  users,
  onToggleBlock,
}: {
  users: AdminUser[]
  onToggleBlock: ToggleBlock
}) {
  const [query, setQuery] = useState("")
  const [role, setRole] = useState("all")
  const [isPending, startTransition] = useTransition()

  const filteredUsers = useMemo(() => {
    const search = query.trim().toLowerCase()

    return users.filter((user) => {
      const matchesRole = role === "all" || user.role === role
      const matchesSearch =
        !search ||
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search)

      return matchesRole && matchesSearch
    })
  }, [users, query, role])

  function handleToggle(user: AdminUser) {
    const nextValue = !user.isBlocked

    startTransition(async () => {
      const result = await onToggleBlock(user.id, nextValue)
      if (result.ok) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name or email"
          aria-label="Search users"
        />
        <select
          value={role}
          onChange={(event) => setRole(event.target.value)}
          aria-label="Filter by role"
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm sm:w-48"
        >
          <option value="all">All roles</option>
          <option value="customer">Customers</option>
          <option value="vendor">Vendors</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      <p className="text-sm text-muted-foreground">
        Showing {filteredUsers.length} of {users.length} users
      </p>

      {filteredUsers.length === 0 ? (
        <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          No users match your search.
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredUsers.map((user) => (
            <Card key={user.id}>
              <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name}
                    width={40}
                    height={40}
                    unoptimized
                    className="size-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex size-10 items-center justify-center rounded-full bg-muted text-sm font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="min-w-0">
                  <CardTitle className="truncate text-base">{user.name}</CardTitle>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-muted px-2.5 py-1 capitalize">
                    {user.role}
                  </span>
                  <span className="rounded-full bg-muted px-2.5 py-1 capitalize">
                    {user.subscriptionPlan ?? "free"}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1",
                      user.isBlocked
                        ? "bg-destructive/10 text-destructive"
                        : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                    )}
                  >
                    {user.isBlocked ? "Blocked" : "Active"}
                  </span>
                </div>
                {user.businessName ? (
                  <p className="text-sm text-muted-foreground">
                    Business: {user.businessName}
                  </p>
                ) : null}
                <Button
                  type="button"
                  variant={user.isBlocked ? "outline" : "destructive"}
                  size="sm"
                  disabled={isPending || user.role === "admin"}
                  onClick={() => handleToggle(user)}
                >
                  {user.isBlocked ? "Unblock" : "Block"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
