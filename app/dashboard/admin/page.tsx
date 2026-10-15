"use client"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { usePermissions } from "@/hooks/usePermissions"
import { securityModules } from "@/lib/security"
import { useLang } from "@/lib/lang-context"
export default function AdminDashboardPage() {
  const { currentUser } = useAuth()
  const access = usePermissions()
  const { lang } = useLang()
  const ar = lang === "ar"
  const modules = securityModules.filter(([key]) => access.can(key + ".read"))
  const href = (key: string) =>
    key === "cms"
      ? "/cms"
      : key === "messages"
        ? "/dashboard/messages"
        : "/dashboard/admin/" + (key === "lectures" ? "public-lectures" : key)
  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-primary">
          {ar ? "لوحة التحكم" : "Admin dashboard"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {ar ? "مرحباً، " : "Welcome, "}
          {currentUser?.name}
        </p>
      </header>
      <h2 className="font-semibold">
        {ar ? "الوحدات المتاحة لك" : "Your available modules"}
      </h2>
      {access.isLoading ? (
        <p role="status">{ar ? "جارٍ التحميل…" : "Loading…"}</p>
      ) : access.error ? (
        <button onClick={access.refresh} className="text-primary underline">
          {ar
            ? "تعذر تحميل الصلاحيات. إعادة المحاولة"
            : "Unable to load permissions. Retry"}
        </button>
      ) : (
        <div className="divide-y rounded-lg border bg-white">
          {modules.map(([key, en, arabic]) => (
            <Link
              key={key}
              href={href(key)}
              className="flex items-center justify-between p-4 font-medium text-primary hover:bg-muted/50"
            >
              {ar ? arabic : en}
              <span aria-hidden="true">{ar ? "←" : "→"}</span>
            </Link>
          ))}
          {access.isSuperAdmin && (
            <Link
              href="/dashboard/admin/security"
              className="block p-4 font-semibold text-primary hover:bg-muted/50"
            >
              {ar ? "إدارة الأمان" : "Security management"}
            </Link>
          )}
          {!modules.length && (
            <p className="p-4 text-muted-foreground">
              {ar
                ? "لم تمنح صلاحيات وحدات بعد. تواصل مع المشرف العام."
                : "No module access has been granted. Contact your Super Admin."}
            </p>
          )}
        </div>
      )}
    </section>
  )
}
