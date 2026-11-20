import Link from "next/link"
import { Mail, MapPin, Pizza } from "lucide-react"

const exploreLinks = [
  { label: "Home", href: "/" },
  { label: "Browse menu", href: "/menu" },
  { label: "Become a vendor", href: "/sign-up" },
]

const accountLinks = [
  { label: "Sign in", href: "/sign-in" },
  { label: "Profile settings", href: "/profile" },
  { label: "My orders", href: "/dashboard/customer/my-orders" },
  { label: "Vendor dashboard", href: "/dashboard/vendor" },
]

const socialLinks = [
  { label: "X", href: "https://x.com", icon: "x" },
  { label: "Instagram", href: "https://instagram.com", icon: "instagram" },
  { label: "Facebook", href: "https://facebook.com", icon: "facebook" },
] as const

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 font-semibold">
            <Pizza className="size-5 text-orange-500" /> PizzaHub
          </div>
          <p className="max-w-xs text-sm text-muted-foreground">
            Good pizza, great vendors and a simple way to order your favourites.
          </p>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p className="flex items-center gap-2">
              <Mail className="size-3" />
              <a href="mailto:hello@pizzahub.example" className="hover:text-foreground">
                hello@pizzahub.example
              </a>
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="size-3" /> Dhaka, Bangladesh
            </p>
          </div>
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

        <div>
          <p className="mb-3 text-sm font-medium">Follow us</p>
          <div className="flex gap-2">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                aria-label={link.label}
                className="flex size-8 items-center justify-center rounded-full border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
              >
                <SocialIcon name={link.icon} />
              </a>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Questions? Reach us any day, 9am–10pm.
          </p>
        </div>
      </div>

      <div className="border-t px-4 py-5 text-center text-xs text-muted-foreground">
        © PizzaHub. All rights reserved.
      </div>
    </footer>
  )
}

function SocialIcon({ name }: { name: "x" | "instagram" | "facebook" }) {
  if (name === "x") {
    // The current X logo (not the old bird) keeps the footer visually up to date.
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-3.5 fill-current">
        <path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-4.9-6.4L6.1 22H3l7.3-8.4L2.8 2h6.5l4.4 5.8L18.9 2Zm-1.1 18h1.7L7.4 3.9H5.6L17.8 20Z" />
      </svg>
    )
  }

  if (name === "instagram") {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="size-4 fill-none stroke-current"
        strokeWidth="2"
      >
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" className="fill-current stroke-none" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-current">
      <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.3-1.5 1.6-1.5h1.7V3.6a22 22 0 0 0-2.5-.1c-2.5 0-4.2 1.5-4.2 4.3v2.1H7.4V13h2.7v8h3.4Z" />
    </svg>
  )
}
