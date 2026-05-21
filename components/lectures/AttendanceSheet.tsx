"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { LectureRegistration, LectureAttendance } from "@/types/lecture"
import { useLang } from "@/lib/lang-context"
import { Check, X, Save } from "lucide-react"

interface AttendanceSheetProps {
  registrations: Array<{
    registration: LectureRegistration
    attendance?: LectureAttendance
  }>
  onMarkAttendance: (
    registrationId: string,
    attended: boolean,
    notes?: string
  ) => Promise<void>
  trigger: React.ReactNode
}

export function AttendanceSheet({
  registrations,
  onMarkAttendance,
  trigger,
}: AttendanceSheetProps) {
  const { lang } = useLang()
  const [open, setOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const activeRegistrations = registrations.filter(
    (item) => item.registration.status !== "cancelled"
  )

  const handleToggle = (registrationId: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(registrationId)) {
      newSelected.delete(registrationId)
    } else {
      newSelected.add(registrationId)
    }
    setSelectedIds(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedIds.size === activeRegistrations.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(
        new Set(activeRegistrations.map((item) => item.registration.id))
      )
    }
  }

  const handleMarkAll = async (attended: boolean) => {
    setIsSubmitting(true)
    for (const registrationId of selectedIds) {
      await onMarkAttendance(
        registrationId,
        attended,
        notes[registrationId]
      )
    }
    setIsSubmitting(false)
    setSelectedIds(new Set())
  }

  const handleMarkSingle = async (
    registrationId: string,
    attended: boolean
  ) => {
    await onMarkAttendance(registrationId, attended, notes[registrationId])
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {lang === "ar" ? "سجل الحضور" : "Attendance Sheet"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                disabled={activeRegistrations.length === 0}
              >
                {selectedIds.size === activeRegistrations.length
                  ? lang === "ar"
                    ? "إلغاء تحديد الكل"
                    : "Deselect All"
                  : lang === "ar"
                    ? "تحديد الكل"
                    : "Select All"}
              </Button>
              <span className="text-sm text-muted-foreground">
                {selectedIds.size} {lang === "ar" ? "محدد" : "selected"}
              </span>
            </div>
            {selectedIds.size > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleMarkAll(true)}
                  disabled={isSubmitting}
                >
                  <Check className="h-4 w-4 me-2" />
                  {lang === "ar" ? "تسجيل حضور" : "Mark Present"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMarkAll(false)}
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4 me-2" />
                  {lang === "ar" ? "تسجيل غياب" : "Mark Absent"}
                </Button>
              </div>
            )}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      selectedIds.size === activeRegistrations.length &&
                      activeRegistrations.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>{lang === "ar" ? "الاسم" : "Name"}</TableHead>
                <TableHead>{lang === "ar" ? "البريد الإلكتروني" : "Email"}</TableHead>
                <TableHead>{lang === "ar" ? "الحضور" : "Attendance"}</TableHead>
                <TableHead>{lang === "ar" ? "ملاحظات" : "Notes"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeRegistrations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    {lang === "ar"
                      ? "لا توجد تسجيلات نشطة"
                      : "No active registrations"}
                  </TableCell>
                </TableRow>
              ) : (
                activeRegistrations.map((item) => (
                  <TableRow key={item.registration.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(item.registration.id)}
                        onCheckedChange={() =>
                          handleToggle(item.registration.id)
                        }
                      />
                    </TableCell>
                    <TableCell>{item.registration.userName}</TableCell>
                    <TableCell>{item.registration.email}</TableCell>
                    <TableCell>
                      {item.attendance ? (
                        <span
                          className={`inline-flex items-center gap-1 text-sm ${
                            item.attendance.attended
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {item.attendance.attended ? (
                            <>
                              <Check className="h-4 w-4" />
                              {lang === "ar" ? "حاضر" : "Present"}
                            </>
                          ) : (
                            <>
                              <X className="h-4 w-4" />
                              {lang === "ar" ? "غائب" : "Absent"}
                            </>
                          )}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          {lang === "ar" ? "لم يُسجل" : "Not marked"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Input
                          value={notes[item.registration.id] || ""}
                          onChange={(e) =>
                            setNotes({
                              ...notes,
                              [item.registration.id]: e.target.value,
                            })
                          }
                          placeholder={
                            lang === "ar" ? "ملاحظات..." : "Notes..."
                          }
                          className="w-32"
                        />
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() =>
                              handleMarkSingle(item.registration.id, true)
                            }
                            disabled={isSubmitting}
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() =>
                              handleMarkSingle(item.registration.id, false)
                            }
                            disabled={isSubmitting}
                          >
                            <X className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  )
}
