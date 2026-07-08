"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useLang } from "@/lib/lang-context"
import { useTraining } from "@/hooks/useTraining"

export default function ReportsPage() {
  const { lang } = useLang()
  const { programs, registrations, certificates, isLoading } = useTraining()

  const totalRegistrations = registrations.length
  const totalCertificates = certificates.length

  const getProgramStats = (programId: string) => {
    const regs = registrations.filter(
      (r) => r.programId === programId && r.status !== "cancelled"
    )
    const total = regs.length
    const completed = regs.filter(
      (r) => r.status === "completed" || r.status === "attended"
    ).length
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0
    return { total, completed, rate }
  }

  if (isLoading) return <div className="p-4">Loading...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">
          {lang === "en" ? "Training Reports" : "تقارير التدريب"}
        </h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">{programs.length}</div>
              <div className="text-sm text-muted-foreground">
                {lang === "en" ? "Programs" : "البرامج"}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">{totalRegistrations}</div>
              <div className="text-sm text-muted-foreground">
                {lang === "en" ? "Total Registrations" : "إجمالي التسجيلات"}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">{totalCertificates}</div>
              <div className="text-sm text-muted-foreground">
                {lang === "en" ? "Certificates Issued" : "الشهادات المصدرة"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {lang === "en" ? "Program Performance" : "أداء البرامج"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{lang === "en" ? "Program" : "البرنامج"}</TableHead>
                <TableHead>{lang === "en" ? "Registrations" : "التسجيلات"}</TableHead>
                <TableHead>{lang === "en" ? "Completed" : "مكتمل"}</TableHead>
                <TableHead>{lang === "en" ? "Completion Rate" : "نسبة الإكمال"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {programs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    {lang === "en" ? "No programs" : "لا توجد برامج"}
                  </TableCell>
                </TableRow>
              )}
              {programs.map((p) => {
                const stats = getProgramStats(p.id)
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.title[lang]}</TableCell>
                    <TableCell>{stats.total}</TableCell>
                    <TableCell>{stats.completed}</TableCell>
                    <TableCell>
                      <Badge
                        variant={stats.rate >= 80 ? "default" : stats.rate >= 50 ? "secondary" : "destructive"}
                      >
                        {stats.rate}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
