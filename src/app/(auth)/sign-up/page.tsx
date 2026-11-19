import type { Metadata } from "next"

import { SignUpForm } from "@/components/auth/sign-up-form"

export const metadata: Metadata = {
  title: "Sign up | Pizza Plaza",
}

export default function SignUpPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-muted/30 px-4 py-10">
      <SignUpForm />
    </main>
  )
}
