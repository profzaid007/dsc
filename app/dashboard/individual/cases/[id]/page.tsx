"use client"
import { CaseDocuments } from "@/components/cases/CaseDocuments"
import { CaseMessages } from "@/components/cases/CaseMessages"
import { CaseName } from "@/components/cases/CaseName"
import { CaseAssessments } from "@/components/assessments/CaseAssessments"
import { CaseFeedback } from "@/components/cases/CaseFeedback"
import { ClientCaseAssignments } from "@/components/clients/ClientCaseAssignments"
import { DataError } from "@/components/ui/data-error"
import { PageLoader } from "@/components/ui/page-loader"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useProfiles } from "@/hooks/useProfiles"
import { useAssignments } from "@/hooks/useAssignments"
import { useToolTypes } from "@/hooks/useToolTypes"
import { useAuth } from "@/hooks/useAuth"
import { useLang } from "@/lib/lang-context"
import { formatDate } from "@/lib/format-date"
import { PaymentGate } from "@/components/cases/PaymentGate"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, User, History } from "lucide-react"
import Link from "next/link"

export default function ProfileDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { lang } = useLang()
  const { getProfileById, isLoading: profilesLoading, loadError: profileError, refresh: refreshProfiles } = useProfiles()
  const { getVisibleAssignments, isLoading: tasksLoading, loadError: tasksError, refresh: refreshTasks } = useAssignments(id)
  const { toolTypes, fetchToolTypes, isLoading: typesLoading, error: typeError } = useToolTypes()
  const { currentUser, isLoading: authLoading } = useAuth()

  const [typesReady, setTypesReady] = useState(false)

  const candidate = getProfileById(id)
  const profile = candidate?.user === currentUser?.id ? candidate : undefined
  const assignments = getVisibleAssignments(id).filter(assignment => assignment.is_visible_to_user === true)

  useEffect(() => {
    let active = true
    void fetchToolTypes().finally(() => { if (active) setTypesReady(true) })
    return () => { active = false }
  }, [fetchToolTypes])
  function retryData() { void refreshProfiles(); void refreshTasks(); void fetchToolTypes() }

  if (authLoading || profilesLoading) {
    return (
      <div className="space-y-6 text-[#082c4a]">
        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-blue-200 bg-[#edf5ff] p-5">
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-7 w-56" />
        </div>
        <Skeleton className="h-44 w-full rounded-xl" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    )
  }

  if (profileError) return <DataError message={profileError} onRetry={retryData} />

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="mb-4 text-xl font-medium">
          {lang === "ar" ? "الحالة غير موجودة" : "Case not found"}
        </h2>
        <Link href="/dashboard/individual/cases">
          <Button>{lang === "ar" ? "العودة إلى الحالات" : "Back to Cases"}</Button>
        </Link>
      </div>
    )
  }

  return (
    <PaymentGate profile={profile}>
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" aria-label={lang === "ar" ? "العودة" : "Back"} onClick={() => router.back()}>
          <ArrowLeft className={`h-5 w-5 ${lang === "ar" ? "rotate-180" : ""}`} />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-primary [overflow-wrap:anywhere]"><CaseName profile={profile} /></h1>
          <p className="text-muted-foreground">
            {lang === "ar" ? `أنشئت في ${formatDate(profile.created)}` : `Created ${formatDate(profile.created)}`}
          </p>
        </div>
      </div>

      <Tabs defaultValue={profile.portal_type === "Attending Training" ? "overview" : "tasks"} className="space-y-4">
        <TabsList className="h-auto flex-wrap gap-2 rounded-xl border border-blue-100 bg-blue-50 p-2">
          <TabsTrigger value="overview">
            {lang === "ar" ? "نظرة عامة" : "Overview"}
          </TabsTrigger>
          <TabsTrigger value="tasks">
            {lang === "ar" ? "التكليفات" : "Assignments"}
            {assignments.length > 0 && (
              <Badge variant="secondary" className="ms-2">
                {assignments.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="documents">{lang === "ar" ? "المستندات" : "Documents"}</TabsTrigger>
          <TabsTrigger value="case-file">
            {lang === "ar" ? "السجل" : "History"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="dsc-detail-cards">
          <div className="dsc-detail-grid">
            {profile.portal_type === "Attending Training" ? (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {lang === "ar" ? "التسجيل في التدريب" : "Training Enrollment"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="dsc-detail-row">
                    <span className="text-muted-foreground">
                      {lang === "ar" ? "نوع الخدمة" : "Service Type"}
                    </span>
                    <span className="font-medium">
                      {lang === "ar" ? "حضور تدريب" : "Attending Training"}
                    </span>
                  </div>
                  <div className="dsc-detail-row">
                    <span className="text-muted-foreground">
                      {lang === "ar" ? "نوع المشكلة" : "Issue Type"}
                    </span>
                    <span className="font-medium">
                      {profile.service_type ||
                        profile.sub_category ||
                        (lang === "ar" ? "حضور تدريب" : "Attending Training")}
                    </span>
                  </div>
                  <div className="dsc-detail-row">
                    <span className="text-muted-foreground">
                      {lang === "ar" ? "الحالة" : "Status"}
                    </span>
                    <Badge variant="secondary">
                      {profile.program_status === "enrolled"
                        ? lang === "ar"
                          ? "مسجل"
                          : "enrolled"
                        : profile.program_status}
                    </Badge>
                  </div>
                  {profile.training_link && (
                    <Link
                      href={profile.training_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 block"
                    >
                      <Button variant="default" className="w-full">
                        {lang === "ar" ? "الانضمام للاجتماع" : "Join Meeting"}
                      </Button>
                    </Link>
                  )}
                  {profile.program_id && (
                    <Link
                      href={`/programmes/training_programmes/${profile.program_id}`}
                      className="mt-2 block"
                    >
                      <Button variant="outline" className="w-full">
                        {lang === "ar"
                          ? "عرض البرنامج التدريبي"
                          : "View Training Program"}
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {lang === "ar" ? "معلومات الحالة" : "Case Information"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="dsc-detail-row">
                      <span className="text-muted-foreground">
                        {lang === "ar" ? "تاريخ الميلاد" : "Date of Birth"}
                      </span>
                      <span className="font-medium">
                        {profile.date_of_birth
                          ? formatDate(profile.date_of_birth)
                          : "—"}
                      </span>
                    </div>
                    <div className="dsc-detail-row">
                      <span className="text-muted-foreground">
                        {lang === "ar" ? "الجنس" : "Gender"}
                      </span>
                      <span className="font-medium capitalize">
                        {profile.gender === "male"
                          ? lang === "ar"
                            ? "ذكر"
                            : "male"
                          : profile.gender === "female"
                            ? lang === "ar"
                              ? "أنثى"
                              : "female"
                            : "—"}
                      </span>
                    </div>
                    <div className="dsc-detail-row">
                      <span className="text-muted-foreground">
                        {lang === "ar" ? "الصف الدراسي" : "Grade"}
                      </span>
                      <span className="font-medium capitalize">
                        {profile.grade || "—"}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {profile.notes && (
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle>{lang === "ar" ? "ملاحظات" : "Notes"}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{profile.notes}</p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-5">
          {tasksLoading || typesLoading || !typesReady ? <PageLoader /> : tasksError || typeError ? <DataError message={tasksError || typeError || ""} onRetry={retryData} /> : <ClientCaseAssignments profile={profile} assignments={assignments} toolTypes={toolTypes} ar={lang === "ar"} role={currentUser!.role} />}
          <CaseMessages key={id} caseId={id} />
          <CaseAssessments caseId={profile.id} />
        </TabsContent>

        <TabsContent value="documents"><CaseDocuments key={id} caseId={id} /></TabsContent>
        <TabsContent value="case-file">
          {tasksLoading ? <PageLoader /> : tasksError ? <DataError message={tasksError} onRetry={retryData} /> : <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                {lang === "ar" ? "السجل" : "History"}
              </CardTitle>
              <CardDescription>
                {lang === "ar"
                  ? "ستكون التكليفات المكتملة هنا"
                  : "Completed Assignments will be here"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {assignments.filter((a) => a.status === "completed").length ===
              0 ? (
                <div className="py-8 text-center">
                  <History className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-medium">
                    {lang === "ar" ? "لا يوجد سجل بعد" : "No history yet"}
                  </h3>
                  <p className="text-muted-foreground">
                    {lang === "ar"
                      ? "ستظهر التكليفات المكتملة هنا"
                      : "Completed assignments will appear here"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {assignments
                    .filter((a) => a.status === "completed")
                    .map((assignment) => (
                      <div
                        key={assignment.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div>
                          <p className="font-medium">
                            {lang === "ar"
                              ? assignment.name_ar || assignment.name_en
                              : assignment.name_en}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {lang === "ar" ? "أكملت في" : "Completed"}{" "}
                            {assignment.updated &&
                              formatDate(assignment.updated)}
                          </p>
                        </div>
                        <Badge variant="default">
                          {lang === "ar" ? "مكتمل" : "Completed"}
                        </Badge>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>}</TabsContent>
      </Tabs>

      <CaseFeedback caseId={profile.id} ownerId={profile.user} />
    </div>
    </PaymentGate>
  )
}
