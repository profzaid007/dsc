"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useProfiles } from "@/hooks/useProfiles"
import { useAssignments } from "@/hooks/useAssignments"
import { useToolTypes } from "@/hooks/useToolTypes"
import { useLang } from "@/lib/lang-context"
import { scheduledCaseSessions } from "@/lib/expert-schedule"
import { ExpertScheduleCalendar } from "@/components/schedule/ExpertScheduleCalendar"
import { PageLoader } from "@/components/ui/page-loader"
import { DataError } from "@/components/ui/data-error"

function AllocatedCaseSchedule() {
  const { lang } = useLang()
  const ar = lang === "ar"
  const cases = useProfiles(true)
  const tasks = useAssignments()
  const types = useToolTypes()
  const { fetchToolTypes } = types
  const [lookupReady, setLookupReady] = useState(false)
  useEffect(() => {
    let active = true
    void fetchToolTypes().finally(() => { if (active) setLookupReady(true) })
    return () => { active = false }
  }, [fetchToolTypes])
  function refresh() {
    void cases.refresh()
    void tasks.refresh()
    void fetchToolTypes()
  }
  if (cases.isLoading || tasks.isLoading || types.isLoading || !lookupReady) return <PageLoader />
  const error = cases.loadError || tasks.loadError || types.error
  if (error) return <DataError message={error} onRetry={refresh} />
  if (!types.toolTypes.some(type => type.key === "one_to_one_meeting")) return <DataError message={ar ? "نوع أداة الاجتماع الفردي غير متوفر. يرجى التواصل مع المسؤول أو إعادة المحاولة." : "The individual meeting tool type is unavailable. Contact an administrator or try again."} onRetry={refresh} />
  const sessions = scheduledCaseSessions(tasks.assignments, cases.profiles, types.toolTypes, ar)
  return <ExpertScheduleCalendar ar={ar} sessions={sessions} />
}

export default function SchedulePage() {
  const { currentUser, isLoading } = useAuth()
  const { lang } = useLang()
  if (isLoading) return <PageLoader />
  if (currentUser?.role !== "expert") return <p role="alert" className="text-sm text-muted-foreground">{lang === "ar" ? "الجدول الزمني متاح للخبراء فقط." : "This schedule is available to experts only."}</p>
  return <AllocatedCaseSchedule key={currentUser.id} />
}
