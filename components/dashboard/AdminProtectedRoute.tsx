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
  const superOnly = /^\/dashboard\/admin\/(backups)(\/|$)/.test(pathname)
  const required = routePermission(pathname)
  const allowed =
    expert ||
    (auth.isAuthenticated &&
      !access.isLoading &&
      !access.error &&
      (superOnly
        ? access.isSuperAdmin
        : required
          ? access.can(required)
          : auth.isAdmin))
  useEffect(() => {
    if (auth.isLoading) return
    if (!auth.isAuthenticated) router.push("/login")
    else if (!auth.isAdmin && !expert && !access.isLoading && !allowed)
      router.push("/dashboard")
  }, [
    auth.isLoading,
    auth.isAuthenticated,
    auth.isAdmin,
    expert,
    access.isLoading,
    required,
    allowed,
    router,
  ])
  if (auth.isLoading || access.isLoading)
    return (
      <p role="status">
        {lang === "ar" ? "جارٍ التحقق من الصلاحيات…" : "Checking permissions…"}
      </p>
    )
  if (!auth.isAuthenticated) return null
  if (auth.isAdmin && access.error) {
    const setupMissing = access.failure === "not_deployed"
    const sessionExpired = access.failure === "session_expired"
    const accountDenied = access.failure === "account_denied"
    return (
      <div role="alert" className="max-w-2xl space-y-3 p-6">
        <h2 className="text-lg font-semibold">
          {setupMissing
            ? lang === "ar"
              ? "لم يتم تفعيل نظام الأمان على الخادم"
              : "Backend security setup is incomplete"
            : sessionExpired
              ? lang === "ar"
                ? "يرجى تسجيل الدخول مرة أخرى"
                : "Please sign in again"
              : accountDenied
                ? lang === "ar"
                  ? "تعذر التحقق من وصول الحساب"
                  : "Account access could not be verified"
                : lang === "ar"
                  ? "تعذر تحميل الصلاحيات"
                  : "Permissions could not be loaded"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {setupMissing
            ? lang === "ar"
              ? "واجهة الأمان غير متاحة على الخادم. يجب على مسؤول الخادم نشر ملفات PocketBase hooks وترحيل الأمان ثم إعادة تشغيل PocketBase."
              : "The backend security endpoint is missing. The server administrator must deploy the PocketBase security hooks and migration, then restart PocketBase."
            : sessionExpired
              ? lang === "ar"
                ? "تعذر التحقق من جلستك الحالية. سجّل الدخول مجدداً للمتابعة."
                : "Your current session could not be verified. Sign in again to continue."
              : accountDenied
                ? lang === "ar"
                  ? "قد يكون الحساب غير نشط. تواصل مع المشرف العام للتحقق من حالة الحساب."
                  : "Your account may be inactive. Contact Super Admin to check its status."
                : lang === "ar"
                  ? "تعذر التحقق من الصلاحيات من خدمة الأمان. تحقق من الاتصال وأعد المحاولة. إذا استمرت المشكلة، تواصل مع مسؤول الخادم."
                  : "Access could not be verified with the security service. Check your connection and retry. If the problem continues, contact the server administrator."}
        </p>
        <div className="flex flex-wrap gap-3">
          <Button onClick={access.refresh}>
            {lang === "ar" ? "إعادة المحاولة" : "Retry"}
          </Button>
          {sessionExpired && (
            <Button
              variant="outline"
              onClick={async () => {
                await auth.logout()
                router.push("/login")
              }}
            >
              {lang === "ar" ? "تسجيل الدخول" : "Sign in"}
            </Button>
          )}
        </div>
      </div>
    )
  }
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
