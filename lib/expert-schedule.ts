import type { CaseTool } from "@/types/assignment"
import type { Profile } from "@/types/profile"
import type { ToolTypeRecord } from "@/lib/tool-types"
import type { OneToOneMeetingConfig } from "@/types/tool"

export type ScheduleSession = {
  id: string; caseId: string; caseName: string; title: string
  date: string; time: string; mode: "online" | "face_to_face" | "unknown"; status: string
}
export type CalendarMonth = { year: number; month: number }
const pad = (value: number) => String(value).padStart(2, "0")

function utcDate(year: number, month: number, day: number) {
  const date = new Date(0)
  date.setUTCFullYear(year, month - 1, day)
  date.setUTCHours(0, 0, 0, 0)
  return date
}

export function parseScheduleDate(value: unknown): { year: number; month: number; day: number } | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const [year, month, day] = value.split("-").map(Number)
  if (year < 1 || year > 9999 || month < 1 || month > 12 || day < 1 || day > 31) return null
  const date = utcDate(year, month, day)
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day ? { year, month, day } : null
}

export function normalizeScheduleTime(value: unknown): string {
  if (typeof value !== "string" || !/^\d{2}:\d{2}(?::\d{2})?$/.test(value)) return ""
  const [hour, minute, second = 0] = value.split(":").map(Number)
  return hour < 24 && minute < 60 && second < 60 ? value.slice(0, 5) : ""
}

export function riyadhToday(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Riyadh", calendar: "gregory", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now)
  const part = (type: string) => parts.find(item => item.type === type)?.value || ""
  return `${part("year")}-${part("month")}-${part("day")}`
}

export function monthDays({ year, month }: CalendarMonth): (string | null)[] {
  const leading = utcDate(year, month, 1).getUTCDay()
  const count = utcDate(year, month + 1, 0).getUTCDate()
  const dates: (string | null)[] = Array.from({ length: leading }, () => null)
  for (let day = 1; day <= count; day++) dates.push(`${String(year).padStart(4, "0")}-${pad(month)}-${pad(day)}`)
  while (dates.length % 7) dates.push(null)
  return dates
}

export function moveCalendarMonth(current: CalendarMonth, delta: number): CalendarMonth {
  const index = Math.max(0, Math.min(9999 * 12 - 1, (current.year - 1) * 12 + current.month - 1 + delta))
  return { year: Math.floor(index / 12) + 1, month: index % 12 + 1 }
}

export function calendarYearOptions(today: string, selectedYear: number, sessions: ScheduleSession[]) {
  const currentYear = parseScheduleDate(today)?.year || selectedYear
  const years = new Set<number>([selectedYear])
  for (let year = Math.max(1, currentYear - 10); year <= Math.min(9999, currentYear + 10); year++) years.add(year)
  for (const session of sessions) { const date = parseScheduleDate(session.date); if (date) years.add(date.year) }
  return [...years].sort((a, b) => a - b)
}

export function scheduledCaseSessions(assignments: CaseTool[], profiles: Pick<Profile, "id" | "name">[], toolTypes: Pick<ToolTypeRecord, "id" | "key">[], ar: boolean): ScheduleSession[] {
  const cases = new Map(profiles.map(profile => [profile.id, profile.name]))
  const meetingTypes = new Set(toolTypes.filter(type => type.key === "one_to_one_meeting").map(type => type.id))
  return assignments.flatMap<ScheduleSession>(task => {
    if (!cases.has(task.case) || !meetingTypes.has(task.type)) return []
    const config = task.config as Partial<OneToOneMeetingConfig> | undefined
    if (!parseScheduleDate(config?.date)) return []
    return [{ id: task.id, caseId: task.case, caseName: cases.get(task.case)!,
      title: (ar ? task.name_ar : task.name_en) || task.name_en || task.name_ar || (ar ? "جلسة فردية" : "Individual session"),
      date: config!.date!, time: normalizeScheduleTime(config?.time),
      mode: config?.meetingType === "online" || config?.meetingType === "face_to_face" ? config.meetingType : "unknown",
      status: task.status,
    }]
  }).sort((a, b) => a.date.localeCompare(b.date) || (a.time || "99:99").localeCompare(b.time || "99:99") || a.title.localeCompare(b.title) || a.id.localeCompare(b.id))
}

export function calendarLocale(ar: boolean) { return ar ? "ar-SA-u-ca-gregory-nu-latn" : "en-GB" }
export function calendarMonthLabel(value: CalendarMonth, ar: boolean) {
  return new Intl.DateTimeFormat(calendarLocale(ar), { calendar: "gregory", timeZone: "UTC", month: "long", year: "numeric" }).format(utcDate(value.year, value.month, 1))
}
export function calendarDayLabel(value: string, ar: boolean) {
  const date = parseScheduleDate(value)
  return date ? new Intl.DateTimeFormat(calendarLocale(ar), { calendar: "gregory", timeZone: "UTC", weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(utcDate(date.year, date.month, date.day)) : ""
}
export function scheduleTimeLabel(value: string, ar: boolean) {
  if (!normalizeScheduleTime(value)) return ar ? "وقت غير محدد" : "Time not specified"
  const [hour, minute] = value.split(":").map(Number)
  const date = utcDate(2026, 1, 1)
  date.setUTCHours(hour, minute)
  return new Intl.DateTimeFormat(calendarLocale(ar), { timeZone: "UTC", hour: "numeric", minute: "2-digit", hour12: true }).format(date)
}
