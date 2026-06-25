"use client"

import Image from "next/image"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Users } from "lucide-react"
import type { Lecture } from "@/types/lecture"
import { useLang } from "@/lib/lang-context"

interface LectureCardProps {
  lecture: Lecture
  onRegister?: () => void
  onView?: () => void
  isRegistered?: boolean
  isFull?: boolean
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

export function LectureCard({
  lecture,
  onRegister,
  onView,
  isRegistered = false,
  isFull = false,
  showStatus = false,
}: LectureCardProps) {
  const { lang } = useLang()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(lang === "ar" ? "ar-AE" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString(lang === "ar" ? "ar-AE" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const isPast = new Date(lecture.schedule.dateTime) < new Date()

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
          {showStatus && (
            <div className="absolute right-2 top-2">
              <Badge className={statusColors[lecture.status]}>
                {statusLabels[lecture.status][lang]}
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
        <h3 className="line-clamp-2 text-lg font-semibold">
          {lecture.title[lang]}
        </h3>
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

        {lecture.maxParticipants && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>
              {lang === "ar" ? "الحد الأقصى:" : "Max:"} {lecture.maxParticipants}{" "}
              {lang === "ar" ? "مشارك" : "participants"}
            </span>
          </div>
        )}

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
