import Link from "next/link"
import { Pizza } from "lucide-react"

const exploreLinks = [
  { label: "Home", href: "/" },
  { label: "Browse menu", href: "/menu" },
  { label: "Become a vendor", href: "/sign-up" },
]

const accountLinks = [
  { label: "Sign in", href: "/sign-in" },
  { label: "My orders", href: "/dashboard/customer/my-orders" },
  { label: "Vendor dashboard", href: "/dashboard/vendor" },
]

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2 font-semibold">
            <Pizza className="size-5 text-orange-500" /> PizzaHub
          </div>
          <p className="max-w-xs text-sm text-muted-foreground">
            Good pizza, great vendors and a simple way to order your favourites.
          </p>
        </div>

        <div>
          <p className="mb-3 text-sm font-medium">Explore</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {exploreLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-foreground">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-3 text-sm font-medium">Account</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {accountLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-foreground">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t px-4 py-5 text-center text-xs text-muted-foreground">
        © PizzaHub. All rights reserved.
      </div>
    </footer>
  )
}
