"use client"

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

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <PageLoader text="Authenticating..." />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <LoadingProvider>
      <div className="flex min-h-screen" dir={lang === "ar" ? "rtl" : "ltr"}>
        <DashboardSidebar />
        <main className="relative flex-1 bg-muted/30">
          <NavigationProgress />
          <div className="p-6">{children}</div>
        </main>
      </div>
    </LoadingProvider>
  )
}
