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
          <Image
            unoptimized
            src={image}
            alt={name || "Profile"}
            width={28}
            height={28}
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 260 56"
              width="260"
              height="56"
              fill="none"
              className="h-8 w-auto"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="pizzaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF512F" />
                  <stop offset="100%" stopColor="#F09819" />
                </linearGradient>
              </defs>
              <g transform="translate(6,5)">
                <rect x="0" y="0" width="46" height="46" rx="14" fill="url(#pizzaGrad)" />
                <g transform="translate(8,7)">
                  <path d="M4 9 C11 3, 21 3, 28 9 L16 32 Z" fill="#FFF3E0" />
                  <path d="M7 11 C12 7, 20 7, 25 11 L22 17 C21 19, 19 19, 19 16 L16 28 L12 18 C11 20, 9 20, 9 17 Z" fill="#FFD166" />
                  <circle cx="14" cy="13" r="2.2" fill="#D90429" />
                  <circle cx="20" cy="14" r="1.9" fill="#D90429" />
                  <circle cx="16" cy="21" r="2.1" fill="#D90429" />
                </g>
              </g>
              <g transform="translate(62,34)">
                <text fontFamily="Poppins, Inter, system-ui, -apple-system, sans-serif" fontSize="26" fontWeight="800" letterSpacing="-0.8">
                  <tspan fill="#1E293B">Pizza</tspan>
                  <tspan fill="#FF512F">Plaza</tspan>
                </text>
                <path d="M72 6 Q102 10 132 6" stroke="#F09819" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              </g>
            </svg>
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
