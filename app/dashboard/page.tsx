"use client"

import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { useProfiles } from "@/hooks/useProfiles"
import { useAssignments } from "@/hooks/useAssignments"
import { useLang } from "@/lib/lang-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageLoader } from "@/components/ui/page-loader"
import { SkeletonStats } from "@/components/ui/skeleton"
import { Users, FolderKanban, ClipboardCheck, Activity } from "lucide-react"

export default function DashboardPage() {
  const { currentUser } = useAuth()
  const { lang } = useLang()
  const { profiles, isLoading: isProfilesLoading } = useProfiles()
  const { assignments, isLoading: isAssignmentsLoading } = useAssignments()

  const isLoading = isProfilesLoading || isAssignmentsLoading

  const stats = [
    {
      title: lang === "ar" ? "الحالات" : "Cases",
      value: profiles.length,
      icon: Users,
      href: "/dashboard/cases",
    },
    {
      title: lang === "ar" ? "إجمالي التعيينات" : "Total Assignments",
      value: assignments.length,
      icon: ClipboardCheck,
      href: "/dashboard/cases",
    },
    {
      title: lang === "ar" ? "المكتملة" : "Completed",
      value: assignments.filter((a) => a.status === "completed").length,
      icon: Activity,
      href: "/dashboard/cases",
    },
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">
              {lang === "ar" ? "لوحة التحكم" : "Dashboard"}
            </h1>
            <p className="text-muted-foreground">
              {lang === "ar"
                ? `مرحباً بعودتك، ${currentUser?.name}`
                : `Welcome back, ${currentUser?.name}`}
            </p>
          </div>
          <Link href="/dashboard/cases/new">
            <Button>{lang === "ar" ? "حالة جديدة" : "New Case"}</Button>
          </Link>
        </div>
        <SkeletonStats count={3} />
        <PageLoader
          text={lang === "ar" ? "جارٍ تحميل بيانات لوحة التحكم..." : "Loading dashboard data..."}
          className="mt-8"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">
            {lang === "ar" ? "لوحة التحكم" : "Dashboard"}
          </h1>
          <p className="text-muted-foreground">
            {lang === "ar"
              ? `مرحباً بعودتك، ${currentUser?.name}`
              : `Welcome back, ${currentUser?.name}`}
          </p>
        </div>
        <Link href="/dashboard/cases/new">
          <Button>{lang === "ar" ? "حالة جديدة" : "New Case"}</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {profiles.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderKanban className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-medium">
              {lang === "ar" ? "لا توجد حالات بعد" : "No cases yet"}
            </h3>
            <p className="mb-4 text-center text-muted-foreground">
              {lang === "ar"
                ? "أنشئ حالتك الأولى للبدء"
                : "Create your first case to get started"}
            </p>
            <Link href="/dashboard/cases/new">
              <Button>{lang === "ar" ? "إنشاء الحالة" : "Create Case"}</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
