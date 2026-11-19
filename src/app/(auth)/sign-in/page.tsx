import type { Metadata } from "next"

import { SignInForm } from "@/components/auth/sign-in-form"

export const metadata: Metadata = {
  title: "Sign in | Pizza Plaza",
}

export default function SignInPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-muted/30 px-4 py-10">
      <SignInForm />
    </main>
  )
}
