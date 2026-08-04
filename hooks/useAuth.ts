"use client"

import { useState, useEffect, useCallback } from "react"
import pb, {
  getCurrentUser,
  isAuthenticated as checkAuth,
  isAdmin as checkIsAdmin,
  isSuperAdmin as checkIsSuperAdmin,
  authWithPassword,
  logout as pbLogout,
} from "@/lib/pb"
import type { User } from "@/types/user"

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const refreshAuth = useCallback(() => {
    const user = getCurrentUser()
    if (user && user.is_active === false) {
      pbLogout()
      setCurrentUser(null)
      setIsAuthenticated(false)
      setIsAdmin(false)
      setIsSuperAdmin(false)
      setIsLoading(false)
      return
    }
    setCurrentUser(user)
    setIsAuthenticated(checkAuth())
    setIsAdmin(checkIsAdmin())
    setIsSuperAdmin(checkIsSuperAdmin())
    setIsLoading(false)
  }, [])

  useEffect(() => {
    refreshAuth()

    const unsubscribe = pb.authStore.onChange(() => {
      refreshAuth()
    })

    return () => {
      unsubscribe()
    }
  }, [refreshAuth])

  const login = async (email: string, password: string) => {
    try {
      const authData = await authWithPassword(email, password)
      const user = authData.record as unknown as User
      if (user && user.is_active === false) {
        await pbLogout()
        return {
          success: false,
          error:
            user.role === "expert"
              ? "Your account is pending approval. You will be able to log in once approved."
              : "Your account has been deactivated. Please contact the administrator.",
        }
      }
      refreshAuth()
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    await pbLogout()
    setCurrentUser(null)
    setIsAuthenticated(false)
    setIsAdmin(false)
    setIsSuperAdmin(false)
  }

  return {
    currentUser,
    isAuthenticated,
    isAdmin,
    isSuperAdmin,
    isLoading,
    login,
    logout,
  }
}
