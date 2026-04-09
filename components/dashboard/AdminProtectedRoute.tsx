"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"

const PUBLIC_ROUTES = ["/login", "/"]

export function AdminProtectedRoute({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { isLoading, isAuthenticated, isAdmin } = useAuth()

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      router.push("/login")
    } else if (!isAdmin) {
      router.push("/dashboard")
    }
  }, [isLoading, isAuthenticated, isAdmin, pathname, router])

  if (!isAuthenticated || !isAdmin) {
    return null
  }

  return <>{children}</>
}
