import {
  CirclePlus,
  ClipboardList,
  CreditCard,
  Crown,
  LayoutDashboard,
  Package,
  ShoppingBag,
  UtensilsCrossed,
  UsersRound,
  type LucideIcon,
} from "lucide-react"

export type DashboardRole = "admin" | "vendor" | "customer"

export type DashboardNavItem = {
  title: string
  href: string
  icon: LucideIcon
}

export type DashboardNav = {
  /** Shown in the sidebar brand and the dashboard header. */
  title: string
  /** Short helper text shown under the title in the dashboard header. */
  description: string
  /** Destination of the sidebar brand link. */
  homeHref: string
  /** Routes that belong to this role's dashboard. */
  items: DashboardNavItem[]
}

// Single source of truth for every role's dashboard links. The sidebar is
// client-side (it needs the active path), so it reads this config by role.
export const dashboardNav: Record<DashboardRole, DashboardNav> = {
  admin: {
    title: "Admin dashboard",
    description: "Manage the whole Pizza Plaza platform",
    homeHref: "/dashboard/admin",
    items: [
      {
        title: "Overview",
        href: "/dashboard/admin",
        icon: LayoutDashboard,
      },
      {
        title: "Manage menu items",
        href: "/dashboard/admin/manange-menu-items",
        icon: UtensilsCrossed,
      },
      {
        title: "Transactions",
        href: "/dashboard/admin/Transactions",
        icon: CreditCard,
      },
      {
        title: "Manage users",
        href: "/dashboard/admin/manage-users",
        icon: UsersRound,
      },
    ],
  },
  vendor: {
    title: "Vendor dashboard",
    description: "Run your menu and keep up with orders",
    homeHref: "/dashboard/vendor",
    items: [
      {
        title: "Overview",
        href: "/dashboard/vendor",
        icon: LayoutDashboard,
      },
      {
        title: "Add menu item",
        href: "/dashboard/vendor/Add-menu-items",
        icon: CirclePlus,
      },
      {
        title: "My menu items",
        href: "/dashboard/vendor/my-menu-items",
        icon: ClipboardList,
      },
      {
        title: "Customer orders",
        href: "/dashboard/vendor/customer-orders",
        icon: ShoppingBag,
      },
      {
        title: "Subscription",
        href: "/dashboard/vendor/subscription",
        icon: Crown,
      },
    ],
  },
  customer: {
    title: "Customer dashboard",
    description: "Track your orders and favourite pizzas",
    homeHref: "/dashboard/customer",
    items: [
      {
        title: "Overview",
        href: "/dashboard/customer",
        icon: LayoutDashboard,
      },
      {
        title: "My orders",
        href: "/dashboard/customer/my-orders",
        icon: Package,
      },
    ],
  },
}
