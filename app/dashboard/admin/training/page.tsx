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
import { useTraining } from "@/hooks/useTraining"
import { ProgramTable } from "@/components/training"
import { useLang } from "@/lib/lang-context"
import { Plus, Search } from "lucide-react"
import type { ProgramStatus } from "@/types/training"

const statusOptions = [
  { value: "all", label: { en: "All Status", ar: "جميع الحالات" } },
  { value: "draft", label: { en: "Draft", ar: "مسودة" } },
  { value: "published", label: { en: "Published", ar: "منشور" } },
  { value: "in_progress", label: { en: "In Progress", ar: "قيد التنفيذ" } },
  { value: "completed", label: { en: "Completed", ar: "مكتمل" } },
  { value: "cancelled", label: { en: "Cancelled", ar: "ملغي" } },
]

export default function AdminTrainingProgramsPage() {
  const router = useRouter()
  const { lang } = useLang()
  const { programs, isLoading, deleteProgram, registrations } = useTraining()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<ProgramStatus | "all">("all")

  const filteredPrograms = programs.filter((program) => {
    const matchesSearch =
      program.title[lang].toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.trainer.name[lang]
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      program.category[lang]
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    const matchesStatus =
      statusFilter === "all" || program.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleDelete = async (id: string) => {
    if (
      window.confirm(
        lang === "ar"
          ? "هل أنت متأكد من حذف هذا البرنامج؟"
          : "Are you sure you want to delete this program?"
      )
    ) {
      await deleteProgram(id)
    }
  }

  const getRegistrationCount = (programId: string) => {
    return registrations.filter(
      (r) => r.programId === programId && r.status !== "cancelled"
    ).length
  }

  const getAttendanceCount = (programId: string) => {
    return registrations.filter(
      (r) =>
        r.programId === programId &&
        (r.status === "attended" || r.status === "completed")
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
            {lang === "ar" ? "البرامج التدريبية" : "Training Programs"}
          </h1>
          <p className="text-muted-foreground">
            {lang === "ar"
              ? "إدارة البرامج التدريبية والتسجيلات والحضور"
              : "Manage training programs, registrations, and attendance"}
          </p>
        </div>
        <Button
          onClick={() =>
            router.push("/dashboard/admin/training/new")
          }
        >
          <Plus className="me-2 h-4 w-4" />
          {lang === "ar" ? "برنامج جديد" : "New Program"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {lang === "ar" ? "جميع البرامج" : "All Programs"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={
                  lang === "ar" ? "البحث في البرامج..." : "Search programs..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) =>
                setStatusFilter(v as ProgramStatus | "all")
              }
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

          {filteredPrograms.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">
                {lang === "ar"
                  ? "لا توجد برامج"
                  : "No programs found"}
              </p>
            </div>
          ) : (
            <ProgramTable
              programs={filteredPrograms}
              onView={(id) =>
                router.push(`/dashboard/admin/training/${id}`)
              }
              onEdit={(id) =>
                router.push(`/dashboard/admin/training/${id}?edit=true`)
              }
              onDelete={handleDelete}
              getRegistrationCount={getRegistrationCount}
              getAttendanceCount={getAttendanceCount}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
