"use client"
import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { usePermissions } from "@/hooks/usePermissions"
import { routePermission } from "@/lib/security"
import { useLang } from "@/lib/lang-context"
import { Button } from "@/components/ui/button"
const EXPERT_ALLOWED_PATHS = [
  "/dashboard/admin/cases",
  "/dashboard/admin/assignments",
  "/dashboard/admin/tools",
]
export function AdminProtectedRoute({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const auth = useAuth()
  const access = usePermissions()
  const { lang } = useLang()
  const expert =
    auth.currentUser?.role === "expert" &&
    EXPERT_ALLOWED_PATHS.some(
      (p) => pathname === p || pathname.startsWith(p + "/")
    )
  const superOnly = /^\/dashboard\/admin\/(security|backups)(\/|$)/.test(
    pathname
  )
  const required = routePermission(pathname)
  const allowed =
    expert ||
    (auth.isAdmin &&
      !access.isLoading &&
      !access.error &&
      (superOnly ? access.isSuperAdmin : !required || access.can(required)))
  useEffect(() => {
    if (auth.isLoading) return
    if (!auth.isAuthenticated) router.push("/login")
    else if (!auth.isAdmin && !expert) router.push("/dashboard")
  }, [auth.isLoading, auth.isAuthenticated, auth.isAdmin, expert, router])
  if (auth.isLoading || (auth.isAdmin && access.isLoading))
    return (
      <p role="status">
        {lang === "ar" ? "جارٍ التحقق من الصلاحيات…" : "Checking permissions…"}
      </p>
    )
  if (!auth.isAuthenticated) return null
  if (!allowed)
    return (
      <div role="alert" className="space-y-3 p-6">
        <p>
          {lang === "ar"
            ? "ليس لديك صلاحية للوصول إلى هذه الصفحة."
            : "You do not have permission to access this page."}
        </p>
        {access.error && (
          <Button onClick={access.refresh}>
            {lang === "ar" ? "إعادة المحاولة" : "Retry"}
          </Button>
        )}
      </div>
    )
  return <>{children}</>
}
