"use client"

import { Toaster as SonnerToaster } from "sonner"

// Global toast container. Render once in the root layout.
export function Toaster() {
  return <SonnerToaster position="top-right" richColors closeButton />
}
