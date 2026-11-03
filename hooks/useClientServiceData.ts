"use client"

import { useEffect, useState } from "react"
import { useProfiles } from "@/hooks/useProfiles"
import { useAssignments } from "@/hooks/useAssignments"
import { useToolTypes } from "@/hooks/useToolTypes"
import { useClientAssignments } from "@/hooks/useClientAssignments"
import { clientScheduledSessions, ownedClientProfiles } from "@/lib/client-services"

export function useClientServiceData(userId: string, ar: boolean, includeSummary = true) {
  const cases = useProfiles()
  const tools = useAssignments()
  const types = useToolTypes()
  const summary = useClientAssignments(includeSummary)
  const { fetchToolTypes } = types
  const [lookupReady, setLookupReady] = useState(false)
  useEffect(() => {
    let active = true
    void fetchToolTypes().finally(() => { if (active) setLookupReady(true) })
    return () => { active = false }
  }, [fetchToolTypes])
  const profiles = ownedClientProfiles(cases.profiles, userId)
  const ids = new Set(profiles.map(profile => profile.id))
  const assignments = (summary.data?.assignments || []).filter(item => ids.has(item.case))
  const scheduleLoading = tools.isLoading || types.isLoading || !lookupReady
  const scheduleError = tools.loadError || types.error || (lookupReady && !types.toolTypes.some(type => type.key === "one_to_one_meeting") ? (ar ? "نوع أداة الجلسات غير متوفر. يرجى التواصل مع الفريق أو إعادة المحاولة." : "The meeting tool type is unavailable. Contact the team or try again.") : "")
  const assignmentLoading = includeSummary && summary.isLoading
  const assignmentError = includeSummary ? summary.error : ""
  const isLoading = cases.isLoading || scheduleLoading || assignmentLoading
  const error = cases.loadError || scheduleError || assignmentError
  const sessions = clientScheduledSessions(tools.assignments, profiles, types.toolTypes, userId, ar)
  const refreshSchedule = () => { void tools.refresh(); void fetchToolTypes() }
  const refresh = () => { void cases.refresh(); refreshSchedule(); if (includeSummary) summary.refresh() }
  return { profiles, assignments, sessions, isLoading, error, refresh, caseLoading: cases.isLoading, caseError: cases.loadError, refreshCases: cases.refresh, assignmentLoading, assignmentError, refreshAssignments: summary.refresh, scheduleLoading, scheduleError, refreshSchedule }
}
