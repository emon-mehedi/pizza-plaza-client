import { cn } from "cn"

type StatusKind = "item" | "order" | "payment" | "plan"

const ITEM_STYLES: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  approved: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  rejected: "bg-destructive/10 text-destructive",
  inactive: "bg-muted text-muted-foreground",
}

const ORDER_STYLES: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  accepted: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  rejected: "bg-destructive/10 text-destructive",
  cancelled: "bg-muted text-muted-foreground",
}

const PAYMENT_STYLES: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  succeeded: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  failed: "bg-destructive/10 text-destructive",
}

const PLAN_STYLES: Record<string, string> = {
  free: "bg-muted text-muted-foreground",
  premium: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
}

const STYLES_BY_KIND: Record<StatusKind, Record<string, string>> = {
  item: ITEM_STYLES,
  order: ORDER_STYLES,
  payment: PAYMENT_STYLES,
  plan: PLAN_STYLES,
}

// Small colored pill for menu item, order, or payment statuses.
export function StatusBadge({
  status,
  kind = "order",
  className,
}: {
  status: string
  kind?: StatusKind
  className?: string
}) {
  const styles = STYLES_BY_KIND[kind][status] ?? "bg-muted text-muted-foreground"

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize",
        styles,
        className
      )}
    >
      {status}
    </span>
  )
}
