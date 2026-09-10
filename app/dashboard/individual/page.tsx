"use client"

import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { useProfiles } from "@/hooks/useProfiles"
import { useLang } from "@/lib/lang-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageLoader } from "@/components/ui/page-loader"
import { ProfileCard } from "@/components/profiles/ProfileCard"
import { FolderKanban, Clock, CheckCircle, Plus } from "lucide-react"

const CASE_HREF_PREFIX = "/dashboard/individual/cases"

export default function IndividualDashboardPage() {
  const { currentUser } = useAuth()
  const { lang } = useLang()
  const { profiles, isLoading } = useProfiles()

  const stats = [
    {
      title: lang === "ar" ? "حالاتي" : "My Cases",
      value: profiles.length,
      icon: FolderKanban,
    },
    {
      title: lang === "ar" ? "قيد المعالجة" : "In Progress",
      value: profiles.filter(
        (p) =>
          p.status === "pending" ||
          p.status === "awaiting_payment" ||
          p.status === "under_review"
      ).length,
      icon: Clock,
    },
    {
      title: lang === "ar" ? "نشطة" : "Active",
      value: profiles.filter((p) => p.status === "active").length,
      icon: CheckCircle,
    },
  ]

  if (isLoading) {
    return (
      <PageLoader
        text={lang === "ar" ? "جارٍ تحميل لوحة التحكم..." : "Loading dashboard..."}
      />
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
        <Link href={`${CASE_HREF_PREFIX}/new`}>
          <Button>
            <Plus className="me-2 h-4 w-4" />
            {lang === "ar" ? "حالة جديدة" : "New Case"}
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
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
        ))}
      </div>

      {profiles.length === 0 ? (
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
            <Link href={`${CASE_HREF_PREFIX}/new`}>
              <Button>{lang === "ar" ? "إنشاء الحالة" : "Create Case"}</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {lang === "ar" ? "أحدث الحالات" : "Recent Cases"}
            </h2>
            <Link
              href={CASE_HREF_PREFIX}
              className="text-sm text-primary hover:underline"
            >
              {lang === "ar" ? "عرض الكل" : "View all"}
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {profiles.slice(0, 6).map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                hrefPrefix={CASE_HREF_PREFIX}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
