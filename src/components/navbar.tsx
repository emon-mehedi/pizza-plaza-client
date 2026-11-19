"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import { Button, buttonVariants } from "@/components/ui/button"
import { signOut, useSession } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

function getDashboardHref(role?: string) {
  if (role === "admin") return "/dashboard/admin"
  if (role === "vendor") return "/dashboard/vendor"
  return "/dashboard/customer"
}

function UserMenu({
  name,
  image,
  role,
}: {
  name?: string | null
  image?: string | null
  role?: string
}) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const dashboardHref = getDashboardHref(role)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  async function handleLogout() {
    setOpen(false)
    await signOut()
    router.push("/")
    router.refresh()
  }

  const initials = (name || "U")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="relative" ref={menuRef}>
      <Button
        type="button"
        variant="ghost"
        className="h-9 gap-2 px-2"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {image ? (
          <img
            src={image}
            alt={name || "Profile"}
            className="size-7 rounded-full object-cover"
          />
        ) : (
          <span className="flex size-7 items-center justify-center rounded-full bg-muted text-xs font-medium">
            {initials}
          </span>
        )}
        <span className="max-w-28 truncate text-sm">{name || "Account"}</span>
      </Button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-48 rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md"
        >
          <Link
            href={dashboardHref}
            role="menuitem"
            className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
            onClick={() => setOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            href="/profile"
            role="menuitem"
            className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
            onClick={() => setOpen(false)}
          >
            Profile Settings
          </Link>
          <button
            type="button"
            role="menuitem"
            className="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-muted"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      ) : null}
    </div>
  )
}

export function Navbar() {
  const pathname = usePathname()
  const { data: session, isPending } = useSession()
  const user = session?.user as
    | { name?: string | null; image?: string | null; role?: string }
    | undefined

  const navLinkClass = (href: string) =>
    cn(
      "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
      pathname === href && "text-foreground"
    )

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logo.jpg"
              alt="PizzaHub"
              width={120}
              height={40}
              className="h-8 w-auto"
              priority
            />
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/" className={navLinkClass("/")}>
              Home
            </Link>
            <Link href="/menu" className={navLinkClass("/menu")}>
              Browse Menu
            </Link>
            {!isPending && user ? (
              <Link
                href={getDashboardHref(user.role)}
                className={navLinkClass(getDashboardHref(user.role))}
              >
                Dashboard
              </Link>
            ) : null}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {isPending ? null : user ? (
            <UserMenu name={user.name} image={user.image} role={user.role} />
          ) : (
            <>
              <Link
                href="/sign-in"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className={cn(buttonVariants({ size: "sm" }))}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
