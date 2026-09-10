"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { PageLoader } from "@/components/ui/page-loader"
import { getDashboardPath } from "@/lib/dashboard-routes"

export default function DashboardRedirectPage() {
  const router = useRouter()
  const { currentUser, isLoading } = useAuth()

  useEffect(() => {
    if (isLoading) return
    if (!currentUser) {
      router.replace("/login")
      return
    }
    router.replace(getDashboardPath(currentUser.role))
  }, [isLoading, currentUser, router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <PageLoader text="Redirecting..." />
    </div>
  )
}
