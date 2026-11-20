"use client"

import { useEffect } from "react"
import { toast } from "sonner"

import { SIGNUP_SUCCESS_KEY } from "@/lib/signup-toast"

/**
 * Social signup leaves the app for Google and comes back via a full-page load,
 * so an inline toast would be lost. This consumes the flag set before leaving.
 */
export function SignupSuccessToast() {
  useEffect(() => {
    if (sessionStorage.getItem(SIGNUP_SUCCESS_KEY) !== "1") return

    sessionStorage.removeItem(SIGNUP_SUCCESS_KEY)
    toast.success("Account created successfully!")
  }, [])

  return null
}
