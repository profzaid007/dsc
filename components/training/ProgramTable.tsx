"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Eye, Users } from "lucide-react"
import type { TrainingProgram } from "@/types/training"
import { useLang } from "@/lib/lang-context"
import { formatDate } from "@/lib/format-date"

interface ProgramTableProps {
  programs: TrainingProgram[]
  onView: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  getRegistrationCount: (programId: string) => number
  getAttendanceCount: (programId: string) => number
}

const statusLabels = {
  draft: { en: "Draft", ar: "مسودة" },
  published: { en: "Published", ar: "منشور" },
  in_progress: { en: "In Progress", ar: "قيد التنفيذ" },
  completed: { en: "Completed", ar: "مكتمل" },
  cancelled: { en: "Cancelled", ar: "ملغي" },
}

const statusVariants = {
  draft: "secondary",
  published: "default",
  in_progress: "outline",
  completed: "outline",
  cancelled: "destructive",
} as const

export function ProgramTable({
  programs,
  onView,
  onEdit,
  onDelete,
  getRegistrationCount,
  getAttendanceCount,
}: ProgramTableProps) {
  const { lang } = useLang()

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{lang === "ar" ? "العنوان" : "Title"}</TableHead>
          <TableHead>{lang === "ar" ? "المدرب" : "Trainer"}</TableHead>
          <TableHead>{lang === "ar" ? "تاريخ البدء" : "Start Date"}</TableHead>
          <TableHead>{lang === "ar" ? "الحالة" : "Status"}</TableHead>
          <TableHead>{lang === "ar" ? "التسجيلات" : "Registrations"}</TableHead>
          <TableHead className="text-right">
            {lang === "ar" ? "الإجراءات" : "Actions"}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {programs.map((program) => {
          const regCount = getRegistrationCount(program.id)
          const attCount = getAttendanceCount(program.id)

          return (
            <TableRow key={program.id}>
              <TableCell className="font-medium max-w-xs truncate">
                {program.title[lang]}
              </TableCell>
              <TableCell>{program.trainer.name[lang]}</TableCell>
              <TableCell>{formatDate(program.schedule.startDate)}</TableCell>
              <TableCell>
                <Badge variant={statusVariants[program.status]}>
                  {statusLabels[program.status][lang]}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {regCount}
                    {program.maxParticipants && ` / ${program.maxParticipants}`}
                  </span>
                  {attCount > 0 && (
                    <span className="text-muted-foreground">
                      ({lang === "ar" ? "حضور:" : "att:"} {attCount})
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => onView(program.id)}
                    title={lang === "ar" ? "عرض" : "View"}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => onEdit(program.id)}
                    title={lang === "ar" ? "تعديل" : "Edit"}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => onDelete(program.id)}
                    title={lang === "ar" ? "حذف" : "Delete"}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
