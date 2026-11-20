import { NoticeCard } from "@/components/notice-card"

// Dashboard-friendly wrapper around the shared notice card.
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: { label: string; href: string }
}) {
  return <NoticeCard title={title} description={description} action={action} />
}
