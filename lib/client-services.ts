import type { Profile } from "@/types/profile"
import type { CaseTool } from "@/types/assignment"
import type { ToolTypeRecord } from "@/lib/tool-types"
import { paymentCaseStatus } from "@/lib/payment-case-status"
import { riyadhToday, scheduledCaseSessions, type ScheduleSession } from "@/lib/expert-schedule"

export type ClientRole = "parent" | "individual" | "organization" | "care_foundation"
export function isClientRole(role: string | undefined | null): role is ClientRole {
  return role === "parent" || role === "individual" || role === "organization" || role === "care_foundation"
}
export function clientRoutes(role: string | undefined | null) {
  const home = role === "organization" ? "/dashboard/institution" : role === "individual" ? "/dashboard/individual" : "/dashboard/parent"
  const cases = `${home}/${role === "organization" ? "projects" : "cases"}`
  return { home, cases, newCase: `${cases}/new`, appointments: `${home}/appointments`, reports: `${home}/reports`, documents: `${home}/documents`, assignments: "/dashboard/assessments", messages: "/dashboard/messages" }
}
export function ownedClientProfiles(profiles: Profile[], userId: string | undefined): Profile[] {
  return userId ? profiles.filter(profile => profile.user === userId) : []
}
export function clientCaseAccessible(profile: Pick<Profile, "status">): boolean {
  return paymentCaseStatus(profile.status) === "active"
}
export function clientScheduledSessions(assignments: CaseTool[], profiles: Profile[], types: ToolTypeRecord[], userId: string | undefined, ar: boolean) {
  const accessible = ownedClientProfiles(profiles, userId).filter(clientCaseAccessible)
  return scheduledCaseSessions(assignments.filter(task => task.is_visible_to_user === true), accessible, types, ar)
}
export function upcomingClientSessions(sessions: ScheduleSession[], now = new Date()) {
  const today = riyadhToday(now)
  const currentTime = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Riyadh", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(now)
  return sessions.filter(session => session.status !== "completed" && (session.date > today || (session.date === today && (!session.time || session.time >= currentTime))))
}
export type ClientAssignmentSummary = {
  id: string; kind: "task" | "assessment"; case: string; caseName: string
  owner_display?: Profile["owner_display"]; name_en: string; name_ar: string; status: string; created: string
}
export type ClientAssignmentData = {
  cases: { id: string; name: string; owner_display?: Profile["owner_display"] }[]
  assignments: ClientAssignmentSummary[]
}
export function clientAssignmentHref(item: Pick<ClientAssignmentSummary, "id" | "kind" | "case">, role: string | null | undefined) {
  return item.kind === "assessment" ? `/dashboard/assessments/${encodeURIComponent(item.id)}` : `${clientRoutes(role).cases}/${encodeURIComponent(item.case)}/tasks/${encodeURIComponent(item.id)}`
}
export function clientAssignmentLabel(item: Pick<ClientAssignmentSummary, "name_ar" | "name_en">, ar: boolean) {
  return (ar ? item.name_ar : item.name_en) || item.name_en || item.name_ar || (ar ? "تكليف بلا عنوان" : "Untitled assignment")
}
export function clientAssignmentStatus(status: string, ar: boolean) {
  const labels: Record<string, [string, string]> = { pending: ["قيد الانتظار", "Pending"], assigned: ["بانتظار إجابتك", "Awaiting your response"], in_progress: ["قيد التنفيذ", "In progress"], incomplete: ["غير مكتمل", "Incomplete"], completed: ["مكتمل", "Completed"] }
  return labels[status]?.[ar ? 0 : 1] || (ar ? "غير محدد" : "Unspecified")
}
