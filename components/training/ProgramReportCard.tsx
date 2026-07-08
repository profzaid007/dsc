"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { ProgramStats } from "@/types/training"
import { useLang } from "@/lib/lang-context"
import { Users, CheckCircle, XCircle } from "lucide-react"

interface ProgramReportCardProps {
  stats: ProgramStats
}

export function ProgramReportCard({ stats }: ProgramReportCardProps) {
  const { lang } = useLang()

  const totalNotCompleted = stats.totalRegistered - stats.totalCompleted

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {lang === "ar" ? "إجمالي المسجلين" : "Total Registered"}
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalRegistered}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {lang === "ar" ? "المكتملون" : "Total Completed"}
          </CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalCompleted}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {lang === "ar" ? "نسبة الإكمال" : "Completion Rate"}
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.attendanceRate}%</div>
          <Progress value={stats.attendanceRate} className="mt-2" />
        </CardContent>
      </Card>

      {totalNotCompleted > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {lang === "ar" ? "لم يكتمل" : "Not Completed"}
            </CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalNotCompleted}</div>
            {stats.totalRegistered > 0 && (
              <p className="mt-1 text-xs text-muted-foreground">
                {Math.round((totalNotCompleted / stats.totalRegistered) * 100)}%{" "}
                {lang === "ar" ? "من المسجلين" : "of registered"}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
