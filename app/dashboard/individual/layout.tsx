"use client"

import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { PageLoader } from "@/components/ui/page-loader"

export default function IndividualLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { currentUser, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && currentUser?.role !== "individual") {
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

  if (currentUser?.role !== "individual") {
    return null
  }

  return <>{children}</>
}
