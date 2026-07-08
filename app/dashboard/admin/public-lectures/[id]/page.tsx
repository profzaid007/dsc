"use client"

import { use, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLectures } from "@/hooks/useLectures"
import { LectureForm } from "@/components/lectures"
import { useLang } from "@/lib/lang-context"
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Edit,
  Trash2,
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
    isLoading,
  } = useLectures()

  const [isEditing, setIsEditing] = useState(
    searchParams.get("edit") === "true"
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  const lecture = getLectureById(id)

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

      {isEditing ? (
        <LectureForm
          initialData={lecture}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
          isSubmitting={isSubmitting}
          submitLabel={lang === "ar" ? "حفظ التغييرات" : "Save Changes"}
        />
      ) : (
        <div className="space-y-6">
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
                      {lang === "ar" ? "رابط التسجيل" : "Recording Link"}
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
                  <p className="font-medium">{lecture.speaker.name[lang]}</p>
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
        </div>
      )}
    </div>
  )
}
