"use client"

import { use, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useLectures } from "@/hooks/useLectures"
import { LectureForm, ReportCard } from "@/components/lectures"
import { AttendanceSheet } from "@/components/lectures/AttendanceSheet"
import { useLang } from "@/lib/lang-context"
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  ExternalLink,
} from "lucide-react"
import type { LectureStatus } from "@/types/lecture"

const statusLabels: Record<LectureStatus, { en: string; ar: string }> = {
  draft: { en: "Draft", ar: "مسودة" },
  published: { en: "Published", ar: "منشور" },
  cancelled: { en: "Cancelled", ar: "ملغي" },
  completed: { en: "Completed", ar: "مكتمل" },
}

const statusColors: Record<LectureStatus, string> = {
  draft: "bg-gray-100 text-gray-800",
  published: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  completed: "bg-blue-100 text-blue-800",
}

export default function AdminLectureDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { lang } = useLang()
  const {
    getLectureById,
    updateLecture,
    deleteLecture,
    getRegistrationsByLecture,
    getAttendanceByLecture,
    getLectureStats,
    markAttendance,
    isLoading,
  } = useLectures()

  const [activeTab, setActiveTab] = useState("overview")
  const [isEditing, setIsEditing] = useState(
    searchParams.get("edit") === "true"
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  const lecture = getLectureById(id)
  const registrations = lecture ? getRegistrationsByLecture(lecture.id) : []
  const attendance = lecture ? getAttendanceByLecture(lecture.id) : []
  const stats = lecture ? getLectureStats(lecture.id) : null

  useEffect(() => {
    if (!isLoading && !lecture) {
      router.push("/dashboard/admin/public-lectures")
    }
  }, [isLoading, lecture, router])

  if (isLoading || !lecture) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">
          {lang === "ar" ? "جاري التحميل..." : "Loading..."}
        </p>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(lang === "ar" ? "ar-AE" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleUpdate = async (
    data: Parameters<typeof updateLecture>[1]
  ) => {
    setIsSubmitting(true)
    try {
      await updateLecture(id, data)
      setIsEditing(false)
    } catch (error) {
      console.error("Failed to update lecture:", error)
      alert(lang === "ar" ? "فشل تحديث المحاضرة" : "Failed to update lecture")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (
      window.confirm(
        lang === "ar"
          ? "هل أنت متأكد من حذف هذه المحاضرة؟"
          : "Are you sure you want to delete this lecture?"
      )
    ) {
      await deleteLecture(id)
      router.push("/dashboard/admin/public-lectures")
    }
  }

  const handleMarkAttendance = async (
    registrationId: string,
    attended: boolean,
    notes?: string
  ) => {
    await markAttendance(registrationId, attended, notes)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/admin/public-lectures")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-primary">
                {lecture.title[lang]}
              </h1>
              <Badge className={statusColors[lecture.status]}>
                {statusLabels[lecture.status][lang]}
              </Badge>
            </div>
              <p className="text-muted-foreground">
                {lecture.speaker.name[lang]}
              </p>
          </div>
        </div>
        <div className="flex gap-2">
          {!isEditing && (
            <>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="me-2 h-4 w-4" />
                {lang === "ar" ? "تعديل" : "Edit"}
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="me-2 h-4 w-4" />
                {lang === "ar" ? "حذف" : "Delete"}
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">
            {lang === "ar" ? "نظرة عامة" : "Overview"}
          </TabsTrigger>
          <TabsTrigger value="registrations">
            {lang === "ar" ? "التسجيلات" : "Registrations"}
          </TabsTrigger>
          <TabsTrigger value="attendance">
            {lang === "ar" ? "الحضور" : "Attendance"}
          </TabsTrigger>
          <TabsTrigger value="report">
            {lang === "ar" ? "التقرير" : "Report"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {isEditing ? (
            <LectureForm
              initialData={lecture}
              onSubmit={handleUpdate}
              onCancel={() => setIsEditing(false)}
              isSubmitting={isSubmitting}
              submitLabel={lang === "ar" ? "حفظ التغييرات" : "Save Changes"}
            />
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {lang === "ar" ? "معلومات المحاضرة" : "Lecture Details"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(lecture.schedule.dateTime)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {lecture.duration}{" "}
                        {lang === "ar" ? "دقيقة" : "minutes"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{lecture.schedule.location}</span>
                    </div>
                    {lecture.meetingLink && (
                      <div className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        <a
                          href={lecture.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {lang === "ar" ? "رابط الاجتماع" : "Meeting Link"}
                        </a>
                      </div>
                    )}
                    {lecture.recordingUrl && (
                      <div className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        <a
                          href={lecture.recordingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {lang === "ar"
                            ? "رابط التسجيل"
                            : "Recording Link"}
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>
                      {lang === "ar" ? "المتحدث" : "Speaker"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="font-medium">
                        {lecture.speaker.name[lang]}
                      </p>
                      {lecture.speaker.role[lang] && (
                        <p className="text-muted-foreground">
                          {lecture.speaker.role[lang]}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>
                    {lang === "ar" ? "الوصف" : "Description"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="mb-2 font-medium">English</h4>
                      <p className="text-muted-foreground">
                        {lecture.description.en}
                      </p>
                    </div>
                    <div className="text-right" dir="rtl">
                      <h4 className="mb-2 font-medium">العربية</h4>
                      <p className="text-muted-foreground">
                        {lecture.description.ar}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {stats && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {lang === "ar" ? "الإحصائيات السريعة" : "Quick Stats"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {lang === "ar" ? "المسجلين" : "Registered"}
                          </p>
                          <p className="text-2xl font-bold">
                            {stats.totalRegistered}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {lang === "ar" ? "الحاضرين" : "Attended"}
                          </p>
                          <p className="text-2xl font-bold">
                            {stats.totalAttended}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <XCircle className="h-5 w-5 text-red-600" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {lang === "ar" ? "عدم الحضور" : "No Show"}
                          </p>
                          <p className="text-2xl font-bold">
                            {stats.noShowCount}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="registrations">
          <Card>
            <CardHeader>
              <CardTitle>
                {lang === "ar" ? "التسجيلات" : "Registrations"} (
                {registrations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{lang === "ar" ? "الاسم" : "Name"}</TableHead>
                    <TableHead>
                      {lang === "ar" ? "البريد الإلكتروني" : "Email"}
                    </TableHead>
                    <TableHead>{lang === "ar" ? "الهاتف" : "Phone"}</TableHead>
                    <TableHead>
                      {lang === "ar" ? "تاريخ التسجيل" : "Registered"}
                    </TableHead>
                    <TableHead>{lang === "ar" ? "الحالة" : "Status"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        {lang === "ar"
                          ? "لا توجد تسجيلات بعد"
                          : "No registrations yet"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    registrations.map((reg) => (
                      <TableRow key={reg.id}>
                        <TableCell>{reg.userName}</TableCell>
                        <TableCell>{reg.email}</TableCell>
                        <TableCell>{reg.phone || "-"}</TableCell>
                        <TableCell>
                          {new Date(reg.registeredAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                        <Badge
                          variant={
                            reg.status === "attended"
                              ? "default"
                              : reg.status === "absent"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {reg.status === "attended"
                            ? lang === "ar"
                              ? "حضر"
                              : "Attended"
                            : reg.status === "absent"
                              ? lang === "ar"
                                ? "غائب"
                                : "Absent"
                              : lang === "ar"
                                ? "مسجل"
                                : "Registered"}
                        </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                {lang === "ar" ? "سجل الحضور" : "Attendance Record"}
              </CardTitle>
              <AttendanceSheet
                registrations={attendance}
                onMarkAttendance={handleMarkAttendance}
                trigger={
                  <Button>
                    {lang === "ar" ? "تسجيل الحضور" : "Mark Attendance"}
                  </Button>
                }
              />
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{lang === "ar" ? "الاسم" : "Name"}</TableHead>
                    <TableHead>
                      {lang === "ar" ? "البريد الإلكتروني" : "Email"}
                    </TableHead>
                    <TableHead>{lang === "ar" ? "الحضور" : "Attended"}</TableHead>
                    <TableHead>{lang === "ar" ? "ملاحظات" : "Notes"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendance.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        {lang === "ar"
                          ? "لا توجد بيانات حضور"
                          : "No attendance data"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    attendance.map((item) => (
                      <TableRow key={item.registration.id}>
                        <TableCell>{item.registration.userName}</TableCell>
                        <TableCell>{item.registration.email}</TableCell>
                        <TableCell>
                          {item.attended ? (
                            <span className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              {lang === "ar" ? "حاضر" : "Present"}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-600">
                              <XCircle className="h-4 w-4" />
                              {lang === "ar" ? "غائب" : "Absent"}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{item.registration.notes || "-"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="report">
          <div className="space-y-6">
            {stats && <ReportCard stats={stats} />}

            <Card>
              <CardHeader>
                <CardTitle>
                  {lang === "ar" ? "ملخص مفصل" : "Detailed Summary"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="mb-2 font-medium">
                      {lang === "ar" ? "التحليلات" : "Analytics"}
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">
                          {lang === "ar" ? "إجمالي التسجيلات:" : "Total registrations:"}
                        </span>
                        <span className="font-medium">{stats?.totalRegistered}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">
                          {lang === "ar" ? "إجمالي الحضور:" : "Total attended:"}
                        </span>
                        <span className="font-medium">{stats?.totalAttended}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">
                          {lang === "ar" ? "نسبة الحضور:" : "Attendance rate:"}
                        </span>
                        <span className="font-medium">{stats?.attendanceRate}%</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">
                          {lang === "ar" ? "عدم الحضور:" : "No-shows:"}
                        </span>
                        <span className="font-medium">{stats?.noShowCount}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">
                          {lang === "ar" ? "الغائبون:" : "Absent:"}
                        </span>
                        <span className="font-medium">{stats?.absentCount}</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="mb-2 font-medium">
                      {lang === "ar" ? "معلومات المحاضرة" : "Lecture Info"}
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">
                          {lang === "ar" ? "العنوان:" : "Title:"}
                        </span>
                        <span className="font-medium">{lecture.title[lang]}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">
                          {lang === "ar" ? "المتحدث:" : "Speaker:"}
                        </span>
                        <span className="font-medium">
                          {lecture.speaker.name[lang]}
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">
                          {lang === "ar" ? "التاريخ:" : "Date:"}
                        </span>
                        <span className="font-medium">
                          {formatDate(lecture.schedule.dateTime)}
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">
                          {lang === "ar" ? "المدة:" : "Duration:"}
                        </span>
                        <span className="font-medium">
                          {lecture.duration} {lang === "ar" ? "دقيقة" : "min"}
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">
                          {lang === "ar" ? "الموقع:" : "Location:"}
                        </span>
                        <span className="font-medium">
                          {lecture.schedule.location}
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
