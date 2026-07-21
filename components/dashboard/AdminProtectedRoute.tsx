"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"

const EXPERT_ALLOWED_PATHS = [
  "/dashboard/admin/cases",
  "/dashboard/admin/assignments",
  "/dashboard/admin/tools",
]

function isExpertAllowedPath(pathname: string): boolean {
  return EXPERT_ALLOWED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  )
}

export function AdminProtectedRoute({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { isLoading, isAuthenticated, isAdmin, currentUser } = useAuth()

  const isExpert = currentUser?.role === "expert"
  const hasAccess = isAdmin || (isExpert && isExpertAllowedPath(pathname))

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      router.push("/login")
    } else if (!isAdmin && !(isExpert && isExpertAllowedPath(pathname))) {
      router.push("/dashboard")
    }
  }, [isLoading, isAuthenticated, isAdmin, isExpert, pathname, router])

  if (!isAuthenticated || !hasAccess) {
    return null
  }

  return <>{children}</>
}
