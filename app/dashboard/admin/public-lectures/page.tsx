"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useLectures } from "@/hooks/useLectures"
import { LectureTable } from "@/components/lectures"
import { useLang } from "@/lib/lang-context"
import { Plus, Search } from "lucide-react"
import type { LectureStatus } from "@/types/lecture"

const statusOptions = [
  { value: "all", label: { en: "All Status", ar: "جميع الحالات" } },
  { value: "published", label: { en: "Published", ar: "منشور" } },
  { value: "draft", label: { en: "Draft", ar: "مسودة" } },
  { value: "completed", label: { en: "Completed", ar: "مكتمل" } },
  { value: "cancelled", label: { en: "Cancelled", ar: "ملغي" } },
]

export default function AdminLecturesPage() {
  const router = useRouter()
  const { lang } = useLang()
  const { lectures, isLoading, deleteLecture, getRegistrationsByLecture } =
    useLectures()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<LectureStatus | "all">("all")

  const filteredLectures = lectures.filter((lecture) => {
    const matchesSearch =
      lecture.title[lang].toLowerCase().includes(searchTerm.toLowerCase()) ||
      lecture.speaker.name[lang]
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    const matchesStatus =
      statusFilter === "all" || lecture.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleDelete = async (id: string) => {
    if (
      window.confirm(
        lang === "ar"
          ? "هل أنت متأكد من حذف هذه المحاضرة؟"
          : "Are you sure you want to delete this lecture?"
      )
    ) {
      await deleteLecture(id)
    }
  }

  const getRegistrationCount = (lectureId: string) => {
    return getRegistrationsByLecture(lectureId).filter(
      (reg) => reg.status !== "absent"
    ).length
  }

  const getAttendanceCount = (lectureId: string) => {
    return getRegistrationsByLecture(lectureId).filter(
      (reg) => reg.status === "attended"
    ).length
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">
          {lang === "ar" ? "جاري التحميل..." : "Loading..."}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">
            {lang === "ar" ? "المحاضرات العامة" : "Public Lectures"}
          </h1>
          <p className="text-muted-foreground">
            {lang === "ar"
              ? "إدارة المحاضرات العامة والتسجيلات والحضور"
              : "Manage public lectures, registrations, and attendance"}
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/admin/public-lectures/new")}>
          <Plus className="me-2 h-4 w-4" />
          {lang === "ar" ? "محاضرة جديدة" : "New Lecture"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {lang === "ar" ? "جميع المحاضرات" : "All Lectures"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={
                  lang === "ar" ? "البحث في المحاضرات..." : "Search lectures..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as LectureStatus | "all")}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label[lang]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <LectureTable
            lectures={filteredLectures}
            onView={(id) =>
              router.push(`/dashboard/admin/public-lectures/${id}`)
            }
            onEdit={(id) =>
              router.push(`/dashboard/admin/public-lectures/${id}?edit=true`)
            }
            onDelete={handleDelete}
            getRegistrationCount={getRegistrationCount}
            getAttendanceCount={getAttendanceCount}
          />
        </CardContent>
      </Card>
    </div>
  )
}
