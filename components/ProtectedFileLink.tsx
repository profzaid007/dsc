"use client"
import pb, { getErrorMessage } from "@/lib/pb"
import { toast } from "sonner"
import type { ComponentProps } from "react"
export async function openProtectedFile(href: string) {
  const popup = window.open("about:blank", "_blank")
  if (popup) popup.opener = null
  try {
    const url = new URL(href, window.location.origin)
    if (
      url.origin !== new URL(pb.baseURL).origin ||
      !url.pathname.includes("/api/files/")
    )
      throw new Error("Invalid file URL")
    url.searchParams.set("token", await pb.files.getToken())
    if (popup) popup.location.replace(url.toString())
    else window.location.assign(url.toString())
  } catch (e) {
    popup?.close()
    toast.error(getErrorMessage(e))
  }
}
export function ProtectedFileLink({
  href,
  children,
  ...props
}: ComponentProps<"a">) {
  return (
    <a
      {...props}
      href={href}
      onClick={(e) => {
        e.preventDefault()
        if (href) void openProtectedFile(href)
      }}
    >
      {children}
    </a>
  )
}
