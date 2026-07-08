"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useLang } from "@/lib/lang-context"
import { useTraining } from "@/hooks/useTraining"
import type { TrainingRegistration } from "@/types/training"

const statusBadgeVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  registered: "secondary",
  attended: "default",
  completed: "default",
  cancelled: "outline",
}

const statusLabels: Record<string, { en: string; ar: string }> = {
  registered: { en: "Registered", ar: "مسجل" },
  attended: { en: "Attended", ar: "حاضر" },
  completed: { en: "Completed", ar: "مكتمل" },
  cancelled: { en: "Cancelled", ar: "ملغي" },
}

export default function RegistrationPage() {
  const { lang } = useLang()
  const {
    registrations,
    programs,
    isLoading,
    updateRegistrationStatus,
    deleteRegistration,
    refresh,
  } = useTraining()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const getProgramName = (reg: TrainingRegistration) => {
    if (reg.programId) {
      const p = programs.find((pr) => pr.id === reg.programId)
      return p ? p.title[lang] : reg.programId
    }
    return "—"
  }

  const getRegType = (reg: TrainingRegistration) => {
    if (reg.programId) return "Program"
    return "—"
  }

  const filteredRegistrations = registrations
    .filter((r) => statusFilter === "all" || r.status === statusFilter)
    .filter(
      (r) =>
        r.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getProgramName(r).toLowerCase().includes(searchTerm.toLowerCase())
    )

  const handleStatusChange = async (
    registrationId: string,
    newStatus: string
  ) => {
    await updateRegistrationStatus(
      registrationId,
      newStatus as TrainingRegistration["status"]
    )
  }

  const handleDelete = async (registrationId: string) => {
    if (window.confirm("Delete this registration?")) {
      await deleteRegistration(registrationId)
    }
  }

  if (isLoading) return <div className="p-4">Loading...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">
          {lang === "en" ? "Registration Management" : "إدارة التسجيلات"}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {lang === "en" ? "All Registrations" : "جميع التسجيلات"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-4">
            <Input
              placeholder={lang === "en" ? "Search registrations..." : "ابحث عن التسجيلات..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {lang === "en" ? "All Status" : "جميع الحالات"}
                </SelectItem>
                {Object.entries(statusLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label[lang]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={refresh}>
              {lang === "en" ? "Refresh" : "تحديث"}
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{lang === "en" ? "Participant" : "المشارك"}</TableHead>
                <TableHead>{lang === "en" ? "Type" : "النوع"}</TableHead>
                <TableHead>{lang === "en" ? "Program / Session" : "البرنامج / الجلسة"}</TableHead>
                <TableHead>{lang === "en" ? "Date" : "التاريخ"}</TableHead>
                <TableHead>{lang === "en" ? "Status" : "الحالة"}</TableHead>
                <TableHead>{lang === "en" ? "Actions" : "الإجراءات"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRegistrations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    {lang === "en" ? "No registrations found" : "لم يتم العثور على تسجيلات"}
                  </TableCell>
                </TableRow>
              )}
              {filteredRegistrations.map((reg) => (
                <TableRow key={reg.id}>
                  <TableCell>
                    <div className="font-medium">{reg.userName}</div>
                    <div className="text-xs text-muted-foreground">
                      {reg.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{getRegType(reg)}</Badge>
                  </TableCell>
                  <TableCell>{getProgramName(reg)}</TableCell>
                  <TableCell>
                    {new Date(reg.registeredAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusBadgeVariant[reg.status] || "secondary"}>
                      {(statusLabels[reg.status] || { en: reg.status, ar: reg.status })[lang]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Select
                        value={reg.status}
                        onValueChange={(v) => handleStatusChange(reg.id, v)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(statusLabels).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label[lang]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(reg.id)}
                      >
                        {lang === "en" ? "Delete" : "حذف"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
