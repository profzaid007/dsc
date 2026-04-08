"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"

const PUBLIC_ROUTES = ["/login", "/"]

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, currentUser } = useAuth()

  useEffect(() => {
    if (!isAuthenticated && !PUBLIC_ROUTES.includes(pathname)) {
      router.push("/login")
    }
  }, [isAuthenticated, pathname, router])

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
