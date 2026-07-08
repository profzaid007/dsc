"use client"

import { use, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
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
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTraining } from "@/hooks/useTraining"
import { ProgramForm, ProgramReportCard } from "@/components/training"
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
  User,
  BookOpen,
  Award,
  Plus,
  Download,
} from "lucide-react"
import type {
  ProgramStatus,
  RegistrationStatus,
  TrainingRegistration,
} from "@/types/training"

const statusLabels: Record<ProgramStatus, { en: string; ar: string }> = {
  draft: { en: "Draft", ar: "مسودة" },
  published: { en: "Published", ar: "منشور" },
  in_progress: { en: "In Progress", ar: "قيد التنفيذ" },
  completed: { en: "Completed", ar: "مكتمل" },
  cancelled: { en: "Cancelled", ar: "ملغي" },
}

const statusColors: Record<ProgramStatus, string> = {
  draft: "bg-gray-100 text-gray-800",
  published: "bg-green-100 text-green-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-blue-100 text-blue-800",
  cancelled: "bg-red-100 text-red-800",
}

const typeLabels = {
  online: { en: "Online", ar: "عبر الإنترنت" },
  in_person: { en: "In-Person", ar: "حضوري" },
  hybrid: { en: "Hybrid", ar: "مختلط" },
}

const registrationLabels: Record<
  RegistrationStatus,
  { en: string; ar: string }
> = {
  registered: { en: "Registered", ar: "مسجل" },
  attended: { en: "Attended", ar: "حضر" },
  completed: { en: "Completed", ar: "مكتمل" },
  cancelled: { en: "Cancelled", ar: "ملغي" },
}

const registrationVariants: Record<RegistrationStatus, "default" | "secondary" | "destructive" | "outline"> = {
  registered: "secondary",
  attended: "default",
  completed: "default",
  cancelled: "destructive",
}

export default function AdminTrainingProgramDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { lang } = useLang()
  const {
    getProgramById,
    updateProgram,
    deleteProgram,
    getRegistrationsByProgram,
    updateRegistrationStatus,
    getProgramStats,
    certificates,
    addCertificate,
    deleteCertificate,
    isLoading,
  } = useTraining()

  const [activeTab, setActiveTab] = useState("overview")
  const [isEditing, setIsEditing] = useState(
    searchParams.get("edit") === "true"
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [certDialogOpen, setCertDialogOpen] = useState(false)
  const [certRegistrationId, setCertRegistrationId] = useState<string>("")
  const [certForm, setCertForm] = useState({
    certificateNumber: "",
    issueDate: new Date().toISOString().split("T")[0],
    notes: "",
  })
  const [certFile, setCertFile] = useState<File | undefined>()
  const [isCertSubmitting, setIsCertSubmitting] = useState(false)

  const program = getProgramById(id)
  const registrations = program ? getRegistrationsByProgram(program.id) : []
  const stats = program ? getProgramStats(program.id) : null
  const programCertificates = program
    ? certificates.filter((c) => c.programId === program.id)
    : []

  const eligibleRegistrations = registrations.filter(
    (r) => r.status === "attended" || r.status === "completed"
  )

  const registrationsWithoutCert = eligibleRegistrations.filter(
    (r) => !programCertificates.some((c) => c.userId === r.userId)
  )

  const resetCertForm = () => {
    setCertRegistrationId("")
    setCertForm({
      certificateNumber: "",
      issueDate: new Date().toISOString().split("T")[0],
      notes: "",
    })
    setCertFile(undefined)
  }

  const handleIssueCertificate = async () => {
    if (!program || !certRegistrationId || !certForm.certificateNumber) return

    const reg = registrations.find((r) => r.id === certRegistrationId) as
      | TrainingRegistration
      | undefined
    if (!reg) return

    setIsCertSubmitting(true)
    try {
      await addCertificate(
        {
          userId: reg.userId,
          userName: reg.userName,
          programId: program.id,
          programName: program.title,
          issueDate: certForm.issueDate,
          certificateNumber: certForm.certificateNumber,
          notes: certForm.notes || undefined,
        },
        certFile
      )
      await updateRegistrationStatus(certRegistrationId, "completed")
      setCertDialogOpen(false)
      resetCertForm()
    } catch (error) {
      console.error("Failed to issue certificate:", error)
      alert(
        lang === "ar" ? "فشل إصدار الشهادة" : "Failed to issue certificate"
      )
    } finally {
      setIsCertSubmitting(false)
    }
  }

  const handleDeleteCertificate = async (id: string) => {
    if (
      window.confirm(
        lang === "ar" ? "هل أنت متأكد من حذف هذه الشهادة؟" : "Are you sure?"
      )
    ) {
      await deleteCertificate(id)
    }
  }

  useEffect(() => {
    if (!isLoading && !program) {
      router.push("/dashboard/admin/training/programs")
    }
  }, [isLoading, program, router])

  if (isLoading || !program) {
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
    })
  }

  const handleUpdate = async (
    data: Parameters<typeof updateProgram>[1]
  ) => {
    setIsSubmitting(true)
    try {
      await updateProgram(id, data)
      setIsEditing(false)
    } catch (error) {
      console.error("Failed to update program:", error)
      alert(lang === "ar" ? "فشل تحديث البرنامج" : "Failed to update program")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (
      window.confirm(
        lang === "ar"
          ? "هل أنت متأكد من حذف هذا البرنامج؟"
          : "Are you sure you want to delete this program?"
      )
    ) {
      await deleteProgram(id)
      router.push("/dashboard/admin/training/programs")
    }
  }

  const handleStatusChange = async (
    registrationId: string,
    newStatus: RegistrationStatus
  ) => {
    try {
      await updateRegistrationStatus(registrationId, newStatus)
    } catch (error) {
      console.error("Failed to update registration status:", error)
    }
  }

  const activeRegistrations = registrations.filter(
    (r) => r.status === "registered" || r.status === "attended" || r.status === "completed"
  )
  const attendedCount = registrations.filter(
    (r) => r.status === "attended" || r.status === "completed"
  ).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/admin/training/programs")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-primary">
                {program.title[lang]}
              </h1>
              <Badge className={statusColors[program.status]}>
                {statusLabels[program.status][lang]}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {program.trainer.name[lang]}
            </p>
          </div>
        </div>
        {!isEditing && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Edit className="me-2 h-4 w-4" />
              {lang === "ar" ? "تعديل" : "Edit"}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="me-2 h-4 w-4" />
              {lang === "ar" ? "حذف" : "Delete"}
            </Button>
          </div>
        )}
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
          <TabsTrigger value="certificates">
            {lang === "ar" ? "الشهادات" : "Certificates"}
            {programCertificates.length > 0 && (
              <Badge variant="secondary" className="ms-2">
                {programCertificates.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="report">
            {lang === "ar" ? "التقرير" : "Report"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {isEditing ? (
            <ProgramForm
              initialData={program}
              onSubmit={handleUpdate}
              onCancel={() => setIsEditing(false)}
              isSubmitting={isSubmitting}
              submitLabel={lang === "ar" ? "حفظ التغييرات" : "Save Changes"}
            />
          ) : (
            <>
              {program.thumbnail && (
                <div className="relative h-64 w-full overflow-hidden rounded-lg bg-muted md:h-80">
                  <Image
                    src={program.thumbnail}
                    alt={program.title[lang]}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              )}

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {lang === "ar" ? "معلومات البرنامج" : "Program Details"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {formatDate(program.schedule.startDate)} -{" "}
                        {formatDate(program.schedule.endDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {program.duration}{" "}
                        {lang === "ar" ? "أيام" : "days"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {program.location} ({typeLabels[program.type][lang]})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span>{program.category[lang]}</span>
                    </div>
                    {program.maxParticipants && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {program.currentRegistrations} / {program.maxParticipants}{" "}
                          {lang === "ar" ? "مسجلين" : "registered"}
                        </span>
                      </div>
                    )}
                    {program.coordinator && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {lang === "ar" ? "المنسق:" : "Coordinator:"}{" "}
                          {program.coordinator}
                        </span>
                      </div>
                    )}
                    {program.meetingLink && (
                      <div className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        <a
                          href={program.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {lang === "ar" ? "رابط الاجتماع" : "Meeting Link"}
                        </a>
                      </div>
                    )}
                    {program.recordingUrl && (
                      <div className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        <a
                          href={program.recordingUrl}
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
                      {lang === "ar" ? "المدرب" : "Trainer"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="font-medium">
                        {program.trainer.name[lang]}
                      </p>
                      {program.trainer.role[lang] && (
                        <p className="text-muted-foreground">
                          {program.trainer.role[lang]}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {program.schedule.sessions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {lang === "ar" ? "الجلسات" : "Sessions"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {program.schedule.sessions.map((session, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-4 rounded-md border p-3"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <span className="text-sm font-semibold">
                              {index + 1}
                            </span>
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-sm font-medium">
                                {formatDate(session.date)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {session.timeFrom} - {session.timeTo}
                              </span>
                            </div>
                            {session.location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  {session.location}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {program.goals && (program.goals.en || program.goals.ar) && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {lang === "ar" ? "الأهداف" : "Goals"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      {program.goals.en && (
                        <div>
                          <h4 className="mb-2 font-medium">English</h4>
                          <p className="text-muted-foreground">
                            {program.goals.en}
                          </p>
                        </div>
                      )}
                      {program.goals.ar && (
                        <div className="text-right" dir="rtl">
                          <h4 className="mb-2 font-medium">العربية</h4>
                          <p className="text-muted-foreground">
                            {program.goals.ar}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {program.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {lang === "ar" ? "ملاحظات" : "Notes"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{program.notes}</p>
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
                    <TableHead className="text-right">
                      {lang === "ar" ? "الإجراءات" : "Actions"}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center">
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
                          <Badge variant={registrationVariants[reg.status]}>
                            {registrationLabels[reg.status][lang]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {reg.status !== "completed" && (
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={() =>
                                  handleStatusChange(reg.id, "completed")
                                }
                                title={
                                  lang === "ar"
                                    ? "تحديد كمكتمل"
                                    : "Mark completed"
                                }
                              >
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </Button>
                            )}
                            {reg.status !== "attended" && (
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={() =>
                                  handleStatusChange(reg.id, "attended")
                                }
                                title={
                                  lang === "ar"
                                    ? "تحديد كحاضر"
                                    : "Mark attended"
                                }
                              >
                                <CheckCircle className="h-4 w-4 text-blue-600" />
                              </Button>
                            )}
                            {reg.status !== "cancelled" && (
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={() =>
                                  handleStatusChange(reg.id, "cancelled")
                                }
                                title={
                                  lang === "ar"
                                    ? "إلغاء التسجيل"
                                    : "Cancel registration"
                                }
                              >
                                <XCircle className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </div>
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
            <CardHeader>
              <CardTitle>
                {lang === "ar" ? "إدارة الحضور" : "Attendance Management"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                {lang === "ar"
                  ? "استخدم علامة الصح بجانب التسجيل لتحديد الحضور، أو العلامة الحمراء للغياب."
                  : "Use the checkmark next to a registration to mark attendance, or the cross for absent."}
              </p>
              {activeRegistrations.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground">
                    {lang === "ar"
                      ? "لا توجد تسجيلات نشطة"
                      : "No active registrations"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          {lang === "ar" ? "إجمالي النشطين" : "Total Active"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {activeRegistrations.length}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          {lang === "ar" ? "حضر" : "Attended"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                          {attendedCount}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          {lang === "ar" ? "نسبة الحضور" : "Attendance Rate"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {activeRegistrations.length > 0
                            ? Math.round(
                                (attendedCount / activeRegistrations.length) * 100
                              )
                            : 0}
                          %
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Separator />

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          {lang === "ar" ? "الاسم" : "Name"}
                        </TableHead>
                        <TableHead>
                          {lang === "ar" ? "البريد الإلكتروني" : "Email"}
                        </TableHead>
                        <TableHead>
                          {lang === "ar" ? "الحضور" : "Attendance"}
                        </TableHead>
                        <TableHead className="text-right">
                          {lang === "ar" ? "الإجراء" : "Action"}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeRegistrations.map((reg) => {
                        const isAttended =
                          reg.status === "attended" || reg.status === "completed"
                        return (
                          <TableRow key={reg.id}>
                            <TableCell>{reg.userName}</TableCell>
                            <TableCell>{reg.email}</TableCell>
                            <TableCell>
                              {isAttended ? (
                                <span className="inline-flex items-center gap-1 text-sm text-green-600">
                                  <CheckCircle className="h-4 w-4" />
                                  {lang === "ar" ? "حاضر" : "Present"}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-sm text-red-600">
                                  <XCircle className="h-4 w-4" />
                                  {lang === "ar" ? "غائب" : "Absent"}
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleStatusChange(
                                    reg.id,
                                    isAttended ? "registered" : "completed"
                                  )
                                }
                              >
                                {isAttended
                                  ? lang === "ar"
                                    ? "إلغاء الحضور"
                                    : "Mark Absent"
                                  : lang === "ar"
                                    ? "تسجيل الحضور"
                                    : "Mark Present"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificates">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>
                  {lang === "ar" ? "الشهادات" : "Certificates"} (
                  {programCertificates.length})
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {lang === "ar"
                    ? "إصدار وإدارة شهادات البرنامج"
                    : "Issue and manage certificates for this program"}
                </p>
              </div>
              <Dialog
                open={certDialogOpen}
                onOpenChange={(open) => {
                  setCertDialogOpen(open)
                  if (!open) resetCertForm()
                }}
              >
                <DialogTrigger asChild>
                  <Button disabled={registrationsWithoutCert.length === 0}>
                    <Plus className="me-2 h-4 w-4" />
                    {lang === "ar" ? "إصدار شهادة" : "Issue Certificate"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-xl">
                  <DialogHeader>
                    <DialogTitle>
                      {lang === "ar" ? "إصدار شهادة جديدة" : "Issue New Certificate"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cert-participant">
                        {lang === "ar" ? "المشارك *" : "Participant *"}
                      </Label>
                      <Select
                        value={certRegistrationId}
                        onValueChange={setCertRegistrationId}
                      >
                        <SelectTrigger id="cert-participant">
                          <SelectValue
                            placeholder={
                              lang === "ar"
                                ? "اختر مشاركاً..."
                                : "Select a participant..."
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {registrationsWithoutCert.length === 0 ? (
                            <SelectItem value="__none__" disabled>
                              {lang === "ar"
                                ? "لا يوجد مشاركون مؤهلون"
                                : "No eligible participants"}
                            </SelectItem>
                          ) : (
                            registrationsWithoutCert.map((reg) => (
                              <SelectItem key={reg.id} value={reg.id}>
                                {reg.userName} ({reg.email})
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cert-program-name">
                        {lang === "ar" ? "البرنامج" : "Program"}
                      </Label>
                      <Input
                        id="cert-program-name"
                        value={program.title[lang]}
                        disabled
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="cert-number">
                          {lang === "ar" ? "رقم الشهادة *" : "Certificate Number *"}
                        </Label>
                        <Input
                          id="cert-number"
                          value={certForm.certificateNumber}
                          onChange={(e) =>
                            setCertForm({
                              ...certForm,
                              certificateNumber: e.target.value,
                            })
                          }
                          placeholder={lang === "ar" ? "مثال: TR-2024-001" : "e.g., TR-2024-001"}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cert-issue-date">
                          {lang === "ar" ? "تاريخ الإصدار" : "Issue Date"}
                        </Label>
                        <Input
                          id="cert-issue-date"
                          type="date"
                          value={certForm.issueDate}
                          onChange={(e) =>
                            setCertForm({
                              ...certForm,
                              issueDate: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cert-file">
                        {lang === "ar" ? "ملف الشهادة (PDF)" : "Certificate File (PDF)"}
                      </Label>
                      <Input
                        id="cert-file"
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={(e) =>
                          setCertFile(e.target.files?.[0] || undefined)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cert-notes">
                        {lang === "ar" ? "ملاحظات" : "Notes"}
                      </Label>
                      <Textarea
                        id="cert-notes"
                        value={certForm.notes}
                        onChange={(e) =>
                          setCertForm({ ...certForm, notes: e.target.value })
                        }
                        rows={2}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCertDialogOpen(false)
                        resetCertForm()
                      }}
                    >
                      {lang === "ar" ? "إلغاء" : "Cancel"}
                    </Button>
                    <Button
                      onClick={handleIssueCertificate}
                      disabled={
                        isCertSubmitting ||
                        !certRegistrationId ||
                        !certForm.certificateNumber
                      }
                    >
                      {isCertSubmitting
                        ? lang === "ar"
                          ? "جاري الحفظ..."
                          : "Saving..."
                        : lang === "ar"
                          ? "إصدار الشهادة"
                          : "Issue Certificate"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {programCertificates.length === 0 ? (
                <div className="py-12 text-center">
                  <Award className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-medium">
                    {lang === "ar"
                      ? "لا توجد شهادات بعد"
                      : "No certificates issued yet"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {lang === "ar"
                      ? "ستظهر الشهادات هنا بعد إصدارها."
                      : "Issued certificates will appear here."}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        {lang === "ar" ? "المشارك" : "Participant"}
                      </TableHead>
                      <TableHead>
                        {lang === "ar" ? "رقم الشهادة" : "Certificate No."}
                      </TableHead>
                      <TableHead>
                        {lang === "ar" ? "تاريخ الإصدار" : "Issue Date"}
                      </TableHead>
                      <TableHead className="text-right">
                        {lang === "ar" ? "الإجراءات" : "Actions"}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {programCertificates.map((cert) => (
                      <TableRow key={cert.id}>
                        <TableCell className="font-medium">
                          {cert.userName}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-xs">
                            {cert.certificateNumber}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {cert.issueDate
                            ? new Date(cert.issueDate).toLocaleDateString(
                                lang === "ar" ? "ar-AE" : "en-US"
                              )
                            : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {cert.file && (
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={() =>
                                  window.open(cert.file, "_blank")
                                }
                                title={
                                  lang === "ar" ? "تحميل" : "Download"
                                }
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleDeleteCertificate(cert.id)}
                              title={lang === "ar" ? "حذف" : "Delete"}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="report">
          <div className="space-y-6">
            {stats && <ProgramReportCard stats={stats} />}

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
                      {lang === "ar" ? "الإحصائيات" : "Analytics"}
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">
                          {lang === "ar" ? "إجمالي التسجيلات:" : "Total registrations:"}
                        </span>
                        <span className="font-medium">
                          {stats?.totalRegistered ?? 0}
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">
                          {lang === "ar" ? "المكتملون:" : "Total completed:"}
                        </span>
                        <span className="font-medium">
                          {stats?.totalCompleted ?? 0}
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">
                          {lang === "ar" ? "نسبة الإكمال:" : "Completion rate:"}
                        </span>
                        <span className="font-medium">
                          {stats?.attendanceRate ?? 0}%
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">
                          {lang === "ar" ? "عدد الجلسات:" : "Sessions:"}
                        </span>
                        <span className="font-medium">
                          {program.schedule.sessions.length}
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">
                          {lang === "ar" ? "الحد الأقصى:" : "Max participants:"}
                        </span>
                        <span className="font-medium">
                          {program.maxParticipants ?? "—"}
                        </span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="mb-2 font-medium">
                      {lang === "ar" ? "معلومات البرنامج" : "Program Info"}
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">
                          {lang === "ar" ? "العنوان:" : "Title:"}
                        </span>
                        <span className="font-medium">
                          {program.title[lang]}
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">
                          {lang === "ar" ? "المدرب:" : "Trainer:"}
                        </span>
                        <span className="font-medium">
                          {program.trainer.name[lang]}
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">
                          {lang === "ar" ? "تاريخ البدء:" : "Start date:"}
                        </span>
                        <span className="font-medium">
                          {formatDate(program.schedule.startDate)}
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">
                          {lang === "ar" ? "المدة:" : "Duration:"}
                        </span>
                        <span className="font-medium">
                          {program.duration}{" "}
                          {lang === "ar" ? "أيام" : "days"}
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">
                          {lang === "ar" ? "الموقع:" : "Location:"}
                        </span>
                        <span className="font-medium">{program.location}</span>
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
