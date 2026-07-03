"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useLang } from "@/lib/lang-context"
import { trainingSessionsCollection } from "@/lib/pb-training"
import type { AwarenessSession } from "@/types/training"
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  ExternalLink,
  User,
  Target,
} from "lucide-react"

const typeLabels = {
  online: { en: "Online", ar: "عبر الإنترنت" },
  in_person: { en: "In-Person", ar: "حضوري" },
  hybrid: { en: "Hybrid", ar: "مختلط" },
}

const statusLabels = {
  draft: { en: "Draft", ar: "مسودة" },
  published: { en: "Published", ar: "منشور" },
  in_progress: { en: "In Progress", ar: "قيد التنفيذ" },
  completed: { en: "Completed", ar: "مكتمل" },
  cancelled: { en: "Cancelled", ar: "ملغي" },
}

export default function AwarenessSessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { lang } = useLang()
  const [session, setSession] = useState<AwarenessSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await trainingSessionsCollection.getById(id)
        setSession(data)
      } catch (err) {
        console.error("Failed to load session:", err)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [id])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(lang === "ar" ? "ar-AE" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">
            {lang === "ar" ? "جاري التحميل..." : "Loading..."}
          </p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="py-12 text-center">
          <h2 className="text-xl font-semibold">
            {lang === "ar" ? "الجلسة غير موجودة" : "Session not found"}
          </h2>
          <Button
            variant="link"
            onClick={() => router.push("/programmes/awareness_sessions")}
          >
            {lang === "ar" ? "العودة إلى جلسات التوعية" : "Back to awareness sessions"}
          </Button>
        </div>
      </div>
    )
  }

  const isPast = new Date(session.schedule.date) < new Date()

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => router.push("/programmes/awareness_sessions")}
      >
        <ArrowLeft className="me-2 h-4 w-4" />
        {lang === "ar" ? "العودة إلى جلسات التوعية" : "Back to awareness sessions"}
      </Button>

      {session.thumbnail && (
        <div className="relative h-64 w-full overflow-hidden rounded-lg bg-muted md:h-80">
          <Image
            src={session.thumbnail}
            alt={session.title[lang]}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h1 className="mb-2 text-3xl font-bold">{session.title[lang]}</h1>
            <p className="text-lg text-white/90">
              {session.speaker.name[lang]}
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {!session.thumbnail && (
            <Card>
              <CardHeader>
                <h1 className="text-3xl font-bold">{session.title[lang]}</h1>
                <p className="text-lg text-muted-foreground">
                  {session.speaker.name[lang]}
                </p>
              </CardHeader>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>
                {lang === "ar" ? "عن هذه الجلسة" : "About this session"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Target className="h-4 w-4" />
                  <span>
                    {lang === "ar" ? "الفئة المستهدفة:" : "Target audience:"}{" "}
                    {session.targetAudience[lang]}
                  </span>
                </div>
                <p className="leading-relaxed text-muted-foreground">
                  {lang === "ar"
                    ? "انضم إلينا في هذه الجلسة التوعوية"
                    : "Join us for this awareness session"}
                </p>
              </div>
            </CardContent>
          </Card>

          {session.notes && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {lang === "ar" ? "ملاحظات" : "Notes"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed text-muted-foreground">
                  {session.notes}
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>
                {lang === "ar" ? "المتحدث" : "Speaker"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {session.speaker.name[lang]}
                  </h3>
                  {session.speaker.role[lang] && (
                    <p className="text-muted-foreground">
                      {session.speaker.role[lang]}
                    </p>
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
                {lang === "ar" ? "تفاصيل الجلسة" : "Session Details"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {formatDate(session.schedule.date)}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {session.schedule.timeFrom} - {session.schedule.timeTo}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {session.duration} {lang === "ar" ? "دقيقة" : "minutes"}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{session.location}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <Badge variant="outline">
                  {typeLabels[session.type][lang]}
                </Badge>
                <Badge
                  className={
                    session.status === "published"
                      ? "bg-green-100 text-green-800"
                      : session.status === "in_progress"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                  }
                >
                  {statusLabels[session.status][lang]}
                </Badge>
              </div>

              {session.maxParticipants && (
                <>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {lang === "ar" ? "المتبقي:" : "Spots left:"}{" "}
                        {session.maxParticipants - session.currentRegistrations} /{" "}
                        {session.maxParticipants}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {session.meetingLink && (
                <>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <ExternalLink className="h-5 w-5 text-muted-foreground" />
                    <a
                      href={session.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline"
                    >
                      {lang === "ar" ? "رابط الاجتماع" : "Join Meeting"}
                    </a>
                  </div>
                </>
              )}

              {session.recordingUrl && (
                <>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <ExternalLink className="h-5 w-5 text-muted-foreground" />
                    <a
                      href={session.recordingUrl}
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
                <Badge variant="secondary" className="w-full justify-center py-2">
                  {lang === "ar" ? "انتهت هذه الجلسة" : "This session has ended"}
                </Badge>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
