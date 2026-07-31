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
import type { Lecture } from "@/types/lecture"
import { useLang } from "@/lib/lang-context"
import { formatDateTime } from "@/lib/format-date"

interface LectureTableProps {
  lectures: Lecture[]
  onView: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  getRegistrationCount: (lectureId: string) => number
  getAttendanceCount: (lectureId: string) => number
}

const statusLabels = {
  draft: { en: "Draft", ar: "مسودة" },
  published: { en: "Published", ar: "منشور" },
  cancelled: { en: "Cancelled", ar: "ملغي" },
  completed: { en: "Completed", ar: "مكتمل" },
}

const statusVariants = {
  draft: "secondary",
  published: "default",
  cancelled: "destructive",
  completed: "outline",
} as const

export function LectureTable({
  lectures,
  onView,
  onEdit,
  onDelete,
  getRegistrationCount,
  getAttendanceCount,
}: LectureTableProps) {
  const { lang } = useLang()

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{lang === "ar" ? "العنوان" : "Title"}</TableHead>
          <TableHead>{lang === "ar" ? "المتحدث" : "Speaker"}</TableHead>
          <TableHead>{lang === "ar" ? "التاريخ" : "Date"}</TableHead>
          <TableHead>{lang === "ar" ? "الحالة" : "Status"}</TableHead>
          <TableHead>{lang === "ar" ? "التسجيلات" : "Registrations"}</TableHead>
          <TableHead className="text-right">
            {lang === "ar" ? "الإجراءات" : "Actions"}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {lectures.map((lecture) => {
          const regCount = getRegistrationCount(lecture.id)
          const attCount = getAttendanceCount(lecture.id)

          return (
            <TableRow key={lecture.id}>
              <TableCell className="font-medium max-w-xs truncate">
                {lecture.title[lang]}
              </TableCell>
              <TableCell>{lecture.speaker.name[lang]}</TableCell>
              <TableCell>{formatDateTime(lecture.schedule.dateTime)}</TableCell>
              <TableCell>
                <Badge variant={statusVariants[lecture.status]}>
                  {statusLabels[lecture.status][lang]}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {regCount}
                    {lecture.maxParticipants && ` / ${lecture.maxParticipants}`}
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
                    onClick={() => onView(lecture.id)}
                    title={lang === "ar" ? "عرض" : "View"}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => onEdit(lecture.id)}
                    title={lang === "ar" ? "تعديل" : "Edit"}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => onDelete(lecture.id)}
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
