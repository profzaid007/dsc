"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLang } from "@/lib/lang-context"
import { useTraining } from "@/hooks/useTraining"

const links = [
  { href: "/dashboard/admin/training/programs", label: { en: "Programs", ar: "البرامج" } },
  { href: "/dashboard/admin/training/awareness", label: { en: "Awareness Sessions", ar: "جلسات التوعية" } },
  { href: "/dashboard/admin/training/registration", label: { en: "Registrations", ar: "التسجيلات" } },
  { href: "/dashboard/admin/training/certificates", label: { en: "Certificates", ar: "الشهادات" } },
  { href: "/dashboard/admin/training/reports", label: { en: "Reports", ar: "التقارير" } },
  { href: "/dashboard/admin/training/scheduling", label: { en: "Calendar", ar: "التقويم" } },
]

export default function TrainingOverviewPage() {
  const { lang } = useLang()
  const { programs, sessions, registrations, certificates, isLoading } = useTraining()

  const activePrograms = programs.filter((p) => p.status !== "cancelled").length
  const upcomingPrograms = programs.filter(
    (p) => p.status === "published" && new Date(p.schedule.startDate) > new Date()
  ).length
  const activeRegistrations = registrations.filter(
    (r) => r.status === "registered" || r.status === "attended"
  ).length

  if (isLoading) return <div className="p-4">Loading...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">
          {lang === "en" ? "Training Management" : "إدارة التدريب"}
        </h1>
        <p className="text-muted-foreground">
          {lang === "en"
            ? "Manage programs, awareness sessions, certificates, and registrations"
            : "إدارة البرامج وجلسات التوعية والشهادات والتسجيلات"}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">{activePrograms}</div>
              <div className="text-sm text-muted-foreground">
                {lang === "en" ? "Active Programs" : "البرامج النشطة"}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">{sessions.length}</div>
              <div className="text-sm text-muted-foreground">
                {lang === "en" ? "Awareness Sessions" : "جلسات التوعية"}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">{activeRegistrations}</div>
              <div className="text-sm text-muted-foreground">
                {lang === "en" ? "Active Registrations" : "التسجيلات النشطة"}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">{certificates.length}</div>
              <div className="text-sm text-muted-foreground">
                {lang === "en" ? "Certificates" : "الشهادات"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>
              {lang === "en" ? "Upcoming Programs" : "البرامج القادمة"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingPrograms === 0 ? (
              <p className="text-sm text-muted-foreground">
                {lang === "en" ? "No upcoming programs" : "لا توجد برامج قادمة"}
              </p>
            ) : (
              <p className="text-2xl font-bold">{upcomingPrograms}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>
              {lang === "en" ? "Recent Registrations" : "آخر التسجيلات"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {registrations.slice(0, 5).map((r) => (
              <div key={r.id} className="flex items-center justify-between text-sm">
                <span>{r.userName}</span>
                <Badge variant="outline">{r.status}</Badge>
              </div>
            ))}
            {registrations.length === 0 && (
              <p className="text-sm text-muted-foreground">
                {lang === "en" ? "No registrations yet" : "لا توجد تسجيلات بعد"}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>
              {lang === "en" ? "Quick Links" : "روابط سريعة"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-md border p-2 text-sm hover:bg-muted transition-colors"
              >
                {link.label[lang]}
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
