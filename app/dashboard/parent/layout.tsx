"use client"

import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { PageLoader } from "@/components/ui/page-loader"

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { currentUser, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !["parent", "care_foundation"].includes(currentUser?.role ?? "")) {
      router.push("/dashboard")
    }
  }, [currentUser, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <PageLoader text="Loading..." />
      </div>
    )
  }

  if (!["parent", "care_foundation"].includes(currentUser?.role ?? "")) {
    return null
  }

  return <>{children}</>
}
