"use client"

import { useState, useEffect, useCallback } from "react"
import pb, {
  getCurrentUser,
  isAuthenticated as checkAuth,
  isAdmin as checkIsAdmin,
  authWithPassword,
  logout as pbLogout,
} from "@/lib/pb"
import type { User } from "@/types/user"

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const refreshAuth = useCallback(() => {
    const user = getCurrentUser()
    setCurrentUser(user)
    setIsAuthenticated(checkAuth())
    setIsAdmin(checkIsAdmin())
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
      await authWithPassword(email, password)
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
  }

  return {
    currentUser,
    isAuthenticated,
    isAdmin,
    isLoading,
    login,
    logout,
  }
}
