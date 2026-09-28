"use client"

import Image from "next/image"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin } from "lucide-react"
import type { Lecture } from "@/types/lecture"
import { useLang } from "@/lib/lang-context"
import { formatDate } from "@/lib/format-date"

interface LectureCardProps {
  lecture: Lecture
  onRegister?: () => void
  onView?: () => void
  isRegistered?: boolean
  showStatus?: boolean
}

const statusLabels = {
  draft: { en: "Draft", ar: "مسودة" },
  published: { en: "Published", ar: "منشور" },
  cancelled: { en: "Cancelled", ar: "ملغي" },
  completed: { en: "Completed", ar: "مكتمل" },
}

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  published: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  completed: "bg-blue-100 text-blue-800",
}

const upcomingColor = "bg-emerald-100 text-emerald-800"

export function LectureCard({
  lecture,
  onRegister,
  onView,
  isRegistered = false,
  showStatus = false,
}: LectureCardProps) {
  const { lang } = useLang()

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString(lang === "ar" ? "ar-AE" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const isPast = new Date(lecture.schedule.dateTime) < new Date()
  const isUpcoming = !isPast

  // A single corner badge, highest priority first. Upcoming and Past are
  // mutually exclusive (a date is either side of now or the other), so they
  // never need to share the corner.
  const cornerBadge = showStatus ? (
    <Badge className={statusColors[lecture.status]}>
      {statusLabels[lecture.status][lang]}
    </Badge>
  ) : isUpcoming ? (
    <Badge className={upcomingColor}>
      {lang === "ar" ? "قادم" : "Upcoming"}
    </Badge>
  ) : (
    <Badge variant="secondary">{lang === "ar" ? "انتهى" : "Past"}</Badge>
  )

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      {lecture.thumbnail && (
        <div className="relative h-48 w-full bg-muted">
          <Image
            src={lecture.thumbnail}
            alt={lecture.title[lang]}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {cornerBadge && (
            <div className="absolute right-2 top-2">{cornerBadge}</div>
          )}
        </div>
      )}

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-lg font-semibold">
            {lecture.title[lang]}
          </h3>
          {/* Without a thumbnail there is no image to overlay, so the tag
              sits inline beside the title instead. */}
          {!lecture.thumbnail && (
            <div className="shrink-0">{cornerBadge}</div>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {lecture.speaker.name[lang]}
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(lecture.schedule.dateTime)}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>
            {formatTime(lecture.schedule.dateTime)} · {lecture.duration}{" "}
            {lang === "ar" ? "دقيقة" : "min"}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span className="truncate">{lecture.schedule.location}</span>
        </div>

        <p className="line-clamp-2 text-sm text-muted-foreground">
          {lecture.description[lang]}
        </p>

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
            >
              {lang === "ar"
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
