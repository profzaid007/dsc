"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { LectureStats } from "@/types/lecture"
import { useLang } from "@/lib/lang-context"
import { Users, CheckCircle, XCircle, UserMinus } from "lucide-react"

interface ReportCardProps {
  stats: LectureStats
}

export function ReportCard({ stats }: ReportCardProps) {
  const { lang } = useLang()

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
            {lang === "ar" ? "إجمالي الحضور" : "Total Attended"}
          </CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalAttended}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {lang === "ar" ? "نسبة الحضور" : "Attendance Rate"}
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.attendanceRate}%</div>
          <Progress value={stats.attendanceRate} className="mt-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {lang === "ar" ? "عدم الحضور" : "No-Show"}
          </CardTitle>
          <XCircle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.noShowCount}</div>
          {stats.totalRegistered > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round(
                (stats.noShowCount / stats.totalRegistered) * 100
              )}% {lang === "ar" ? "من المسجلين" : "of registered"}
            </p>
          )}
        </CardContent>
      </Card>

      {stats.cancellationCount > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {lang === "ar" ? "الإلغاءات" : "Cancellations"}
            </CardTitle>
            <UserMinus className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.cancellationCount}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
