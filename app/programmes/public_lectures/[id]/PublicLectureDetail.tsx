"use client"

import { usePublicEventTime } from "@/components/PublicEventTime"
import { publicEventDate, publicEventDateLabel } from "@/lib/public-event-dates"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useLang } from "@/lib/lang-context"
import type { Lecture } from "@/types/lecture"
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  User,
  Briefcase,
} from "lucide-react"

export default function PublicLectureDetail({ lecture }: { lecture: Lecture }) {
  const router = useRouter()
  const { lang } = useLang()
  const clock = usePublicEventTime()!
  const { hydrated } = clock



  const formatTime = (dateString: string) => {
    const date = publicEventDate(dateString, hydrated)
    return date.toLocaleTimeString(lang === "ar" ? "ar-AE" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
      ...(!hydrated ? { timeZone: "UTC" } : {}),
    })
  }

  const isPast = publicEventDate(lecture.schedule.dateTime, hydrated).getTime() < clock.now

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => router.push("/programmes")}
      >
        <ArrowLeft className="me-2 h-4 w-4" />
        {lang === "ar" ? "العودة إلى المحاضرات" : "Back to lectures"}
      </Button>

      {lecture.thumbnail && (
        <div className="relative h-64 w-full overflow-hidden rounded-lg bg-muted md:h-80">
          <Image
            src={lecture.thumbnail}
            alt={lecture.title[lang]}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute right-0 bottom-0 left-0 p-6 text-white">
            <h1 className="mb-2 text-3xl font-bold">{lecture.title[lang]}</h1>
            <p className="text-lg text-white/90">
              {lecture.speaker.name[lang]}
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {!lecture.thumbnail && (
            <Card>
              <CardHeader>
                <h1 className="text-3xl font-bold">{lecture.title[lang]}</h1>
                <p className="text-lg text-muted-foreground">
                  {lecture.speaker.name[lang]}
                </p>
              </CardHeader>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>
                {lang === "ar" ? "عن هذه المحاضرة" : "About this lecture"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed text-muted-foreground">
                {lecture.description[lang]}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{lang === "ar" ? "المتحدث" : "Speaker"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {lecture.speaker.name[lang]}
                  </h3>
                  {lecture.speaker.role[lang] && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Briefcase className="h-4 w-4" />
                      <span>{lecture.speaker.role[lang]}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {lang === "ar" ? "تفاصيل المحاضرة" : "Lecture Details"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {publicEventDateLabel(lecture.schedule.dateTime, hydrated)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatTime(lecture.schedule.dateTime)}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {lecture.duration} {lang === "ar" ? "دقيقة" : "minutes"}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{lecture.schedule.location}</p>
                </div>
              </div>

              {lecture.meetingLink && (
                <>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <ExternalLink className="h-5 w-5 text-muted-foreground" />
                    <a
                      href={lecture.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline"
                    >
                      {lang === "ar" ? "رابط الاجتماع" : "Join Meeting"}
                    </a>
                  </div>
                </>
              )}

              {lecture.recordingUrl && (
                <>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <ExternalLink className="h-5 w-5 text-muted-foreground" />
                    <a
                      href={lecture.recordingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline"
                    >
                      {lang === "ar" ? "مشاهدة التسجيل" : "Watch Recording"}
                    </a>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {isPast && (
            <Card>
              <CardContent className="pt-6">
                <Badge
                  variant="secondary"
                  className="w-full justify-center py-2"
                >
                  {lang === "ar"
                    ? "انتهت هذه المحاضرة"
                    : "This lecture has ended"}
                </Badge>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
