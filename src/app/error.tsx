"use client"

import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Something went wrong</CardTitle>
          <CardDescription>
            We could not load this page. Please try again or browse the menu.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-wrap gap-3">
          <button type="button" onClick={reset} className={buttonVariants()}>
            Try again
          </button>
          <Link href="/menu" className={buttonVariants({ variant: "outline" })}>
            Browse menu
          </Link>
        </CardFooter>
      </Card>
    </main>
  )
}
