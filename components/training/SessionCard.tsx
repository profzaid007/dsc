"use client"

import Image from "next/image"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Users, Presentation } from "lucide-react"
import type { AwarenessSession } from "@/types/training"
import { useLang } from "@/lib/lang-context"

interface SessionCardProps {
  session: AwarenessSession
  onRegister?: () => void
  onView?: () => void
  isRegistered?: boolean
  isFull?: boolean
  showStatus?: boolean
}

const statusLabels = {
  draft: { en: "Draft", ar: "مسودة" },
  published: { en: "Published", ar: "منشور" },
  in_progress: { en: "In Progress", ar: "قيد التنفيذ" },
  completed: { en: "Completed", ar: "مكتمل" },
  cancelled: { en: "Cancelled", ar: "ملغي" },
}

const statusColors = {
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

export function SessionCard({
  session,
  onRegister,
  onView,
  isRegistered = false,
  isFull = false,
  showStatus = false,
}: SessionCardProps) {
  const { lang } = useLang()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(lang === "ar" ? "ar-AE" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const isPast = new Date(session.schedule.date) < new Date()

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      {session.thumbnail && (
        <div className="relative h-48 w-full bg-muted">
          <Image
            src={session.thumbnail}
            alt={session.title[lang]}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {showStatus && (
            <div className="absolute right-2 top-2">
              <Badge className={statusColors[session.status]}>
                {statusLabels[session.status][lang]}
              </Badge>
            </div>
          )}
          {isPast && !showStatus && (
            <div className="absolute right-2 top-2">
              <Badge variant="secondary">
                {lang === "ar" ? "انتهى" : "Past"}
              </Badge>
            </div>
          )}
        </div>
      )}

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-lg font-semibold">
            {session.title[lang]}
          </h3>
          {!showStatus && (
            <Badge variant="outline" className="shrink-0">
              {typeLabels[session.type][lang]}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {lang === "ar" ? "المتحدث:" : "Speaker:" } {session.speaker.name[lang]}
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(session.schedule.date)}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>
            {session.schedule.timeFrom} - {session.schedule.timeTo}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span className="truncate">{session.location}</span>
        </div>

        {session.maxParticipants && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>
              {lang === "ar" ? "المتبقي:" : "Spots left:"}{" "}
              {session.maxParticipants - session.currentRegistrations} /{" "}
              {session.maxParticipants}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Presentation className="h-4 w-4" />
          <span>{session.targetAudience[lang]}</span>
        </div>

        <div className="flex gap-2 pt-2">
          {onView && (
            <Button variant="outline" className="flex-1" onClick={onView}>
              {lang === "ar" ? "عرض التفاصيل" : "View Details"}
            </Button>
          )}
          {onRegister && !isPast && !isRegistered && (
            <Button
              className="flex-1"
              onClick={onRegister}
              disabled={isFull}
            >
              {isFull
                ? lang === "ar"
                  ? "ممتلئ"
                  : "Full"
                : lang === "ar"
                  ? "تسجيل"
                  : "Register"}
            </Button>
          )}
          {isRegistered && !isPast && (
            <Button variant="secondary" className="flex-1" disabled>
              {lang === "ar" ? "مسجل" : "Registered"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
