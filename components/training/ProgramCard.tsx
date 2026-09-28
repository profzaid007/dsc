"use client"

import Image from "next/image"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Users, BookOpen } from "lucide-react"
import type { TrainingProgram } from "@/types/training"
import { useLang } from "@/lib/lang-context"
import { formatDate } from "@/lib/format-date"

interface ProgramCardProps {
  program: TrainingProgram
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

const upcomingColor = "bg-emerald-100 text-emerald-800"

export function ProgramCard({
  program,
  onRegister,
  onView,
  isRegistered = false,
  isFull = false,
  showStatus = false,
}: ProgramCardProps) {
  const { lang } = useLang()

  const isPast = new Date(program.schedule.endDate) < new Date()
  // "Upcoming" means not yet started. A programme that has started but not yet
  // finished is in progress: neither upcoming nor past, so it gets no tag.
  const isUpcoming = !isPast && new Date(program.schedule.startDate) >= new Date()

  // A single corner badge, highest priority first. Upcoming and Past are
  // mutually exclusive, so they never need to share the corner.
  const cornerBadge = showStatus ? (
    <Badge className={statusColors[program.status]}>
      {statusLabels[program.status][lang]}
    </Badge>
  ) : isUpcoming ? (
    <Badge className={upcomingColor}>{lang === "ar" ? "قادم" : "Upcoming"}</Badge>
  ) : isPast ? (
    <Badge variant="secondary">{lang === "ar" ? "انتهى" : "Past"}</Badge>
  ) : null

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      {program.thumbnail && (
        <div className="relative h-48 w-full bg-muted">
          <Image
            src={program.thumbnail}
            alt={program.title[lang]}
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
            {program.title[lang]}
          </h3>
          <div className="flex shrink-0 items-center gap-1.5">
            {!showStatus && (
              <Badge variant="outline">
                {typeLabels[program.type][lang]}
              </Badge>
            )}
            {/* Without a thumbnail there is no image to overlay, so the
                status/upcoming tag sits inline beside the type badge. */}
            {!program.thumbnail && cornerBadge}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {lang === "ar" ? "المدرب:" : "Trainer:" } {program.trainer.name[lang]}
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            {formatDate(program.schedule.startDate)} -{" "}
            {formatDate(program.schedule.endDate)}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>
            {program.duration}{" "}
            {lang === "ar" ? "أيام" : "days"}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span className="truncate">{program.location}</span>
        </div>

        {program.maxParticipants && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>
              {lang === "ar" ? "المتبقي:" : "Spots left:"}{" "}
              {program.maxParticipants - program.currentRegistrations} /{" "}
              {program.maxParticipants}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BookOpen className="h-4 w-4" />
          <span>{program.category[lang]}</span>
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
