"use client"
import Link from "next/link"
import { useSyncExternalStore } from "react"
import { useLang } from "@/lib/lang-context"
import { usePermissions } from "@/hooks/usePermissions"

export const SECURITY_SECTIONS = [
  ["roles", "Roles & permissions", "الأدوار والصلاحيات"],
  ["users", "User access", "وصول المستخدمين"],
  ["audit", "Audit history", "سجل التدقيق"],
] as const
function subscribe(callback: () => void) {
  window.addEventListener("hashchange", callback)
  return () => window.removeEventListener("hashchange", callback)
}
export function SecuritySidebar() {
  const { lang } = useLang()
  const { isSuperAdmin } = usePermissions()
  const section = useSyncExternalStore(subscribe, () => window.location.hash.slice(1) || "roles", () => "roles")
  if (!isSuperAdmin) return null
  return <aside className="w-full shrink-0 bg-primary p-4 text-primary-foreground md:w-64">
    <Link href="/dashboard/admin" className="mb-5 block rounded-lg px-3 py-3 text-sm hover:bg-white/10">{lang === "ar" ? "لوحة التحكم" : "Dashboard"}</Link>
    <h2 className="mb-3 px-3 font-semibold">{lang === "ar" ? "إدارة الأمان" : "Security management"}</h2>
    <nav aria-label={lang === "ar" ? "أقسام الأمان" : "Security sections"} className="flex flex-wrap gap-1 md:flex-col">
      {SECURITY_SECTIONS.map(([key,en,ar]) => <a key={key} href={`#${key}`} aria-current={section === key ? "page" : undefined}
        onClick={event => {
          const allowed = window.dispatchEvent(new CustomEvent("dsc:security-section-request", {cancelable:true}))
          if (!allowed) event.preventDefault()
        }}
        className={`rounded-lg px-3 py-3 text-sm ${section === key ? "bg-white/20" : "hover:bg-white/10"}`}>{lang === "ar" ? ar : en}</a>)}
    </nav>
  </aside>
}
