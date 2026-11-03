"use client"

import { useAuth } from "@/hooks/useAuth"
import { useLang } from "@/lib/lang-context"
import { useClientServiceData } from "@/hooks/useClientServiceData"
import { clientRoutes, isClientRole, type ClientRole } from "@/lib/client-services"
import type { ScheduleSession } from "@/lib/expert-schedule"
import { ExpertScheduleCalendar } from "@/components/schedule/ExpertScheduleCalendar"
import { PageLoader } from "@/components/ui/page-loader"
import { DataError } from "@/components/ui/data-error"

export function ClientScheduleView({ ar, role, sessions, today }: { ar: boolean; role: ClientRole; sessions: ScheduleSession[]; today?: string }) {
  const project = role === "organization"
  return <ExpertScheduleCalendar ar={ar} sessions={sessions} today={today} title={ar ? "مواعيدي" : "My appointments"}
    description={project ? (ar ? "الجلسات المشتركة معك للمشاريع النشطة. اختر الشهر والسنة، ثم اليوم لعرض مواعيدك." : "Sessions shared with you for active projects. Choose a month and year, then a day to view your appointments.") : (ar ? "الجلسات المشتركة معك للحالات النشطة. اختر الشهر والسنة، ثم اليوم لعرض مواعيدك." : "Sessions shared with you for active cases. Choose a month and year, then a day to view your appointments.")}
    caseHrefPrefix={clientRoutes(role).cases} caseLabel={project ? (ar ? "المشروع: " : "Project: ") : undefined} caseActionLabel={project ? (ar ? "فتح المشروع" : "Open project") : undefined} />
}
function ScheduleData({ userId, role }: { userId: string; role: ClientRole }) {
  const { lang } = useLang(), ar = lang === "ar"
  const data = useClientServiceData(userId, ar, false)
  if (data.isLoading) return <PageLoader />
  if (data.error) return <DataError message={data.error} onRetry={data.refresh} />
  return <ClientScheduleView ar={ar} role={role} sessions={data.sessions} />
}
export function ClientSchedule() {
  const { currentUser, isLoading } = useAuth()
  const { lang } = useLang()
  if (isLoading) return <PageLoader />
  if (!currentUser || !isClientRole(currentUser.role)) return <p role="alert">{lang === "ar" ? "المواعيد الشخصية متاحة للعملاء فقط." : "Personal appointments are available to clients only."}</p>
  return <ScheduleData key={`${currentUser.id}:${currentUser.role}`} userId={currentUser.id} role={currentUser.role} />
}
