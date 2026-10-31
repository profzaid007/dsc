"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { useLang } from "@/lib/lang-context"
import { DashboardSidebar } from "@/components/dashboard/Sidebar"
import { LoadingProvider } from "@/components/loading-provider"
import { NavigationProgress } from "@/components/navigation-progress"
import { PageLoader } from "@/components/ui/page-loader"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const { lang } = useLang()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) router.replace("/login")
  }, [isAuthLoading, isAuthenticated, router])

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <PageLoader text={lang === "ar" ? "جارٍ التحقق من الحساب..." : "Authenticating..."} />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
        <p role="status">
          {lang === "ar"
            ? "يرجى تسجيل الدخول للمتابعة. جارٍ فتح صفحة تسجيل الدخول…"
            : "Please sign in to continue. Opening the login page…"}
        </p>
        <Link href="/login" className="text-primary underline">
          {lang === "ar" ? "تسجيل الدخول" : "Sign in"}
        </Link>
      </div>
    )
  }

  return (
    <LoadingProvider>
      <div className="flex min-h-screen min-w-0 flex-col md:flex-row" dir={lang === "ar" ? "rtl" : "ltr"}>
        <DashboardSidebar />
        <main className="relative min-w-0 flex-1 bg-muted/30">
          <NavigationProgress />
          <div className="dashboard-content p-4 sm:p-6">{children}</div>
        </main>
      </div>
    </LoadingProvider>
  )
}
