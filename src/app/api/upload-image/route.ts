import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const key = process.env.IMGBB_SECRET

  if (!key) {
    return NextResponse.json(
      { error: "Image upload is not configured." },
      { status: 500 }
    )
  }

  const formData = await request.formData()
  const image = formData.get("image")

  if (!(image instanceof File) || image.size === 0) {
    return NextResponse.json(
      { error: "Please select an image to upload." },
      { status: 400 }
    )
  }

  const uploadData = new FormData()
  uploadData.append("image", image)

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${key}`, {
    method: "POST",
    body: uploadData,
  })

  const data = (await response.json()) as {
    success?: boolean
    data?: { url?: string; display_url?: string }
    error?: { message?: string }
  }

  if (!response.ok || !data.success || !data.data) {
    return NextResponse.json(
      { error: data.error?.message ?? "Image upload failed." },
      { status: 500 }
    )
  }

  return NextResponse.json({
    url: data.data.display_url ?? data.data.url ?? "",
  })
}
