"use client"

import { useAuth } from "@/hooks/useAuth"
import { useLang } from "@/lib/lang-context"
import { DashboardSidebar } from "@/components/dashboard/Sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated } = useAuth()
  const { lang } = useLang()

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex min-h-screen" dir={lang === "ar" ? "rtl" : "ltr"}>
      <DashboardSidebar />
      <main className="flex-1 bg-muted/30 p-6">{children}</main>
    </div>
  )
}
