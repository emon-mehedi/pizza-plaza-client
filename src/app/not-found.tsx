import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Page not found</CardTitle>
          <CardDescription>
            That page does not exist or the link may have changed.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-wrap gap-3">
          <Link href="/" className={buttonVariants()}>
            Go home
          </Link>
          <Link href="/menu" className={buttonVariants({ variant: "outline" })}>
            Browse menu
          </Link>
        </CardFooter>
      </Card>
    </main>
  )
}
