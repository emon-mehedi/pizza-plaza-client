import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type NoticeAction = {
  label: string
  href: string
}

// A simple centered card for "empty", "unavailable", or "sign in required"
// states. Pass an action to show a link button below the text.
export function NoticeCard({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: NoticeAction
}) {
  return (
    <Card className="mx-auto w-full max-w-lg">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {action ? (
        <CardFooter>
          <Link href={action.href} className={buttonVariants()}>
            {action.label}
          </Link>
        </CardFooter>
      ) : null}
    </Card>
  )
}
