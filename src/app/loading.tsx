import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <main
      className="mx-auto w-full max-w-7xl flex-1 px-4 py-10"
      aria-label="Loading page"
    >
      <div className="space-y-6">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-56 w-full" />
          ))}
        </div>
      </div>
    </main>
  )
}
