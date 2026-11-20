import Link from "next/link"
import { Suspense } from "react"
import { headers } from "next/headers"
import { CheckCircle2, Clock3, XCircle } from "lucide-react"

import { NoticeCard } from "@/components/notice-card"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { apiFetch } from "@/lib/api-server"
import { auth } from "@/lib/auth"
import { BASE_API_URL } from "@/lib/base-url"

export const instant = false

const PaymentSuccessPage = ({
  searchParams,
}: PageProps<"/payment/success">) => {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Payment result</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Checking your Premium payment with Stripe.
          </p>
        </div>

        <Suspense fallback={<ResultFallback />}>
          <PaymentResult searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  )
}

async function PaymentResult({
  searchParams,
}: Pick<PageProps<"/payment/success">, "searchParams">) {
  const params = await searchParams
  const rawSessionId = params.session_id
  const sessionId = Array.isArray(rawSessionId) ? rawSessionId[0] : rawSessionId

  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user?.role !== "vendor") {
    return (
      <NoticeCard
        title="Vendor sign-in required"
        description="Sign in with the vendor account that started the payment."
        action={{ label: "Sign in", href: "/sign-in" }}
      />
    )
  }

  if (!sessionId || !BASE_API_URL) {
    return (
      <NoticeCard
        title="Missing payment session"
        description="We could not find the checkout session to check."
        action={{ label: "Go to subscription", href: "/dashboard/vendor/subscription" }}
      />
    )
  }

  let result: { status: string; isPremium: boolean } | null = null
  try {
    const response = await apiFetch(
      `/payments/session/${encodeURIComponent(sessionId)}`,
      { withAuth: true }
    )
    if (response.ok) {
      result = (await response.json()) as { status: string; isPremium: boolean }
    }
  } catch {
    result = null
  }

  if (!result) {
    return (
      <NoticeCard
        title="Could not check the payment"
        description="The payment service is unavailable right now. Please try again."
        action={{
          label: "Try again",
          href: `/payment/success?session_id=${encodeURIComponent(sessionId)}`,
        }}
      />
    )
  }

  const isSuccess = result.status === "succeeded" || result.isPremium
  const isPending = result.status === "pending"

  return (
    <Card>
      <CardHeader className="items-center text-center">
        {isSuccess ? (
          <CheckCircle2 className="size-10 text-emerald-500" />
        ) : isPending ? (
          <Clock3 className="size-10 text-amber-500" />
        ) : (
          <XCircle className="size-10 text-destructive" />
        )}
        <CardTitle>
          {isSuccess ? "Premium is active!" : isPending ? "Payment is being confirmed" : "Payment was not completed"}
        </CardTitle>
        <CardDescription>
          {isSuccess
            ? "Your unlimited menu is ready. Thank you for supporting PizzaHub."
            : isPending
              ? "Stripe checks payments in the background. This page will update once the webhook arrives."
              : "No charge was made. You can try again whenever you are ready."}
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex flex-wrap justify-center gap-3">
        <Link href="/dashboard/vendor/subscription" className={buttonVariants()}>
          Back to subscription
        </Link>
        {isPending ? (
          <Link
            href={`/payment/success?session_id=${encodeURIComponent(sessionId)}`}
            className={buttonVariants({ variant: "outline" })}
          >
            Check again
          </Link>
        ) : null}
        <Link href="/dashboard/vendor/my-menu-items" className={buttonVariants({ variant: "outline" })}>
          My menu items
        </Link>
      </CardFooter>
    </Card>
  )
}

function ResultFallback() {
  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="mx-auto h-10 w-10 animate-pulse rounded-full bg-muted" />
        <div className="h-6 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
      </CardHeader>
    </Card>
  )
}

export default PaymentSuccessPage
