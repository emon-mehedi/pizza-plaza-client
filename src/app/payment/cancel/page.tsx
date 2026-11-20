import Link from "next/link"
import { XCircle } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const PaymentCancelPage = () => {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <Card className="w-full max-w-lg">
        <CardHeader className="items-center text-center">
          <XCircle className="size-10 text-amber-500" />
          <CardTitle>Payment cancelled</CardTitle>
          <CardDescription>
            You did not complete the checkout, so your plan has not changed.
            No charges were made.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-wrap justify-center gap-3">
          <Link href="/dashboard/vendor/subscription" className={buttonVariants()}>
            Back to subscription
          </Link>
          <Link href="/dashboard/vendor" className={buttonVariants({ variant: "outline" })}>
            Go to dashboard
          </Link>
        </CardFooter>
      </Card>
    </main>
  )
}

export default PaymentCancelPage
