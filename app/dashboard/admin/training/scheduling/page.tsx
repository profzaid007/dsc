"use client"

import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLang } from "@/lib/lang-context"
import { useTraining } from "@/hooks/useTraining"

type CalendarEvent = {
  id: string
  title: string
  date: Date
  type: "program" | "awareness"
  location?: string
  meetingLink?: string
  status: string
}

export default function SchedulingPage() {
  const { lang } = useLang()
  const { programs, sessions, isLoading } = useTraining()

  const events = useMemo(() => {
    const result: CalendarEvent[] = []

    for (const p of programs) {
      if (p.schedule.startDate) {
        result.push({
          id: p.id,
          title: p.title[lang],
          date: new Date(p.schedule.startDate),
          type: "program" as const,
          location: p.location,
          meetingLink: p.meetingLink,
          status: p.status,
        })
      }
    }

    for (const s of sessions) {
      if (s.schedule.date) {
        result.push({
          id: s.id,
          title: s.title[lang],
          date: new Date(s.schedule.date),
          type: "awareness" as const,
          location: s.schedule.location || s.location,
          meetingLink: s.meetingLink,
          status: s.status,
        })
      }
    }

    result.sort((a, b) => a.date.getTime() - b.date.getTime())
    return result
  }, [programs, sessions, lang])

  const groupedByMonth = useMemo(() => {
    const groups: Record<string, CalendarEvent[]> = {}
    for (const event of events) {
      const key = `${event.date.getFullYear()}-${String(event.date.getMonth() + 1).padStart(2, "0")}`
      if (!groups[key]) groups[key] = []
      groups[key].push(event)
    }
    return groups
  }, [events])

  const monthLabels: Record<string, { en: string; ar: string }> = {
    "01": { en: "January", ar: "يناير" },
    "02": { en: "February", ar: "فبراير" },
    "03": { en: "March", ar: "مارس" },
    "04": { en: "April", ar: "أبريل" },
    "05": { en: "May", ar: "مايو" },
    "06": { en: "June", ar: "يونيو" },
    "07": { en: "July", ar: "يوليو" },
    "08": { en: "August", ar: "أغسطس" },
    "09": { en: "September", ar: "سبتمبر" },
    "10": { en: "October", ar: "أكتوبر" },
    "11": { en: "November", ar: "نوفمبر" },
    "12": { en: "December", ar: "ديسمبر" },
  }

  if (isLoading) return <div className="p-4">Loading...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">
          {lang === "en" ? "Training Calendar" : "تقويم التدريب"}
        </h1>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {lang === "en"
              ? "No scheduled programs or sessions yet"
              : "لا توجد برامج أو جلسات مجدولة بعد"}
          </CardContent>
        </Card>
      ) : (
        Object.entries(groupedByMonth).map(([monthKey, monthEvents]) => {
          const [, month] = monthKey.split("-")
          const year = monthEvents[0].date.getFullYear()
          return (
            <div key={monthKey} className="space-y-2">
              <h2 className="text-lg font-semibold text-primary">
                {monthLabels[month]?.[lang] || month} {year}
              </h2>
              <div className="space-y-2">
                {monthEvents.map((event) => (
                  <Card key={`${event.type}-${event.id}`}>
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="flex min-w-[60px] flex-col items-center rounded-md border p-2 text-center">
                        <span className="text-lg font-bold">
                          {event.date.getDate()}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {event.date.toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US", {
                            weekday: "short",
                          })}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={event.type === "program" ? "default" : "secondary"}
                          >
                            {event.type === "program"
                              ? lang === "en"
                                ? "Program"
                                : "برنامج"
                              : lang === "en"
                                ? "Awareness"
                                : "توعوي"}
                          </Badge>
                          <span className="font-medium">{event.title}</span>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-2 text-sm text-muted-foreground">
                          <span>
                            {event.date.toLocaleTimeString(lang === "ar" ? "ar-SA" : "en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {event.location && <span>· {event.location}</span>}
                          {event.meetingLink && (
                            <a
                              href={event.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {lang === "en" ? "Meeting Link" : "رابط الاجتماع"}
                            </a>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline">{event.status}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
