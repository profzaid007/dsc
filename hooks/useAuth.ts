import { useAppStore } from "@/lib/store"

export function useAuth() {
  const currentUser = useAppStore((state) => state.currentUser)
  const isAuthenticated = useAppStore((state) => state.isAuthenticated)
  const isAdmin = useAppStore((state) => state.isAdmin)
  const login = useAppStore((state) => state.login)
  const logout = useAppStore((state) => state.logout)

  return {
    currentUser,
    isAuthenticated,
    isAdmin,
    login,
    logout,
  }
}
