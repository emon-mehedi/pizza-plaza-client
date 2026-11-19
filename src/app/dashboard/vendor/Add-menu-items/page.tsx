import { headers } from "next/headers"

import {
  AddMenuItemForm,
  type AddMenuItemFormState,
} from "@/components/vendor/add-menu-item-form"
import { auth } from "@/lib/auth"
import { BASE_API_URL } from "@/lib/base-url"
import type { IMenuItem } from "@/lib/types/all-types"

const INITIAL_STATE: AddMenuItemFormState = { status: "idle", message: null, key: 0 }

const AddMenuItemPage = () => {
  async function createMenuItem(
    prevState: AddMenuItemFormState,
    formData: FormData
  ): Promise<AddMenuItemFormState> {
    "use server"

    // Read the session on the server so vendorId cannot be spoofed by the client.
    const session = await auth.api.getSession({ headers: await headers() })
    const user = session?.user as { id?: string; role?: string } | undefined

    if (!user?.id || user.role !== "vendor") {
      return {
        status: "error",
        message: "You must be signed in as a vendor to add menu items.",
        key: prevState.key,
      }
    }

    if (!BASE_API_URL) {
      return {
        status: "error",
        message: "The API is not configured.",
        key: prevState.key,
      }
    }

    const itemName = String(formData.get("itemName") ?? "").trim()
    const category = String(formData.get("category") ?? "").trim()
    const description = String(formData.get("description") ?? "").trim()
    const price = Number(formData.get("price"))
    const location = String(formData.get("location") ?? "").trim()
    const images = String(formData.get("images") ?? "").trim()

    if (
      !itemName ||
      !category ||
      !description ||
      !location ||
      !images ||
      !Number.isFinite(price) ||
      price <= 0
    ) {
      return {
        status: "error",
        message: "Please complete every field with a valid value.",
        key: prevState.key,
      }
    }

    const item: IMenuItem = {
      vendorId: user.id,
      itemName,
      category,
      description,
      price,
      location,
      images,
      status: "pending",
      createdAt: new Date().toISOString(),
    }

    try {
      const response = await fetch(`${BASE_API_URL}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      })

      if (!response.ok) {
        return {
          status: "error",
          message: `Could not save the item (status ${response.status}). Please try again.`,
          key: prevState.key,
        }
      }

      return {
        status: "success",
        message: `"${itemName}" was submitted for review.`,
        key: prevState.key + 1,
      }
    } catch {
      return {
        status: "error",
        message: "Could not reach the server. Please try again.",
        key: prevState.key,
      }
    }
  }

  return (
    <main className="flex flex-1 justify-center bg-muted/30 px-4 py-10">
      <AddMenuItemForm action={createMenuItem} initialState={INITIAL_STATE} />
    </main>
  )
}

export default AddMenuItemPage
