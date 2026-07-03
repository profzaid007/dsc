"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useLang } from "@/lib/lang-context"
import { trainingProgramsCollection } from "@/lib/pb-training"
import type { TrainingProgram } from "@/types/training"
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  ExternalLink,
  User,
  BookOpen,
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

export default function TrainingProgrammeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { lang } = useLang()
  const [program, setProgram] = useState<TrainingProgram | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await trainingProgramsCollection.getById(id)
        setProgram(data)
      } catch (err) {
        console.error("Failed to load programme:", err)
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

  if (!program) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="py-12 text-center">
          <h2 className="text-xl font-semibold">
            {lang === "ar" ? "البرنامج غير موجود" : "Programme not found"}
          </h2>
          <Button
            variant="link"
            onClick={() => router.push("/programmes/training_programmes")}
          >
            {lang === "ar" ? "العودة إلى البرامج التدريبية" : "Back to training programmes"}
          </Button>
        </div>
      </div>
    )
  }

  const isPast = new Date(program.schedule.endDate) < new Date()

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => router.push("/programmes/training_programmes")}
      >
        <ArrowLeft className="me-2 h-4 w-4" />
        {lang === "ar" ? "العودة إلى البرامج التدريبية" : "Back to training programmes"}
      </Button>

      {program.thumbnail && (
        <div className="relative h-64 w-full overflow-hidden rounded-lg bg-muted md:h-80">
          <Image
            src={program.thumbnail}
            alt={program.title[lang]}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h1 className="mb-2 text-3xl font-bold">{program.title[lang]}</h1>
            <p className="text-lg text-white/90">
              {program.trainer.name[lang]}
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {!program.thumbnail && (
            <Card>
              <CardHeader>
                <h1 className="text-3xl font-bold">{program.title[lang]}</h1>
                <p className="text-lg text-muted-foreground">
                  {program.trainer.name[lang]}
                </p>
              </CardHeader>
            </Card>
          )}

          {program.goals && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {lang === "ar" ? "عن هذا البرنامج" : "About this programme"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed text-muted-foreground">
                  {program.goals[lang]}
                </p>
              </CardContent>
            </Card>
          )}

          {program.notes && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {lang === "ar" ? "ملاحظات" : "Notes"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed text-muted-foreground">
                  {program.notes}
                </p>
              </CardContent>
            </Card>
          )}

          {program.schedule.sessions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {lang === "ar" ? "جلسات البرنامج" : "Programme Sessions"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {program.schedule.sessions.map((session, idx) => (
                  <div key={idx} className="rounded-lg border p-4">
                    <p className="mb-2 font-medium">
                      {lang === "ar" ? `الجلسة ${idx + 1}` : `Session ${idx + 1}`}
                    </p>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(session.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>
                          {session.timeFrom} - {session.timeTo}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{session.location}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>
                {lang === "ar" ? "المدرب" : "Trainer"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {program.trainer.name[lang]}
                  </h3>
                  {program.trainer.role[lang] && (
                    <p className="text-muted-foreground">
                      {program.trainer.role[lang]}
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
                {lang === "ar" ? "تفاصيل البرنامج" : "Programme Details"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {formatDate(program.schedule.startDate)} - {formatDate(program.schedule.endDate)}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {program.duration} {lang === "ar" ? "أيام" : "days"}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{program.location}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{program.category[lang]}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <Badge variant="outline">
                  {typeLabels[program.type][lang]}
                </Badge>
                <Badge
                  className={
                    program.status === "published"
                      ? "bg-green-100 text-green-800"
                      : program.status === "in_progress"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                  }
                >
                  {statusLabels[program.status][lang]}
                </Badge>
              </div>

              {program.maxParticipants && (
                <>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {lang === "ar" ? "المتبقي:" : "Spots left:"}{" "}
                        {program.maxParticipants - program.currentRegistrations} /{" "}
                        {program.maxParticipants}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {program.meetingLink && (
                <>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <ExternalLink className="h-5 w-5 text-muted-foreground" />
                    <a
                      href={program.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline"
                    >
                      {lang === "ar" ? "رابط الاجتماع" : "Join Meeting"}
                    </a>
                  </div>
                </>
              )}

              {program.recordingUrl && (
                <>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <ExternalLink className="h-5 w-5 text-muted-foreground" />
                    <a
                      href={program.recordingUrl}
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
                  {lang === "ar" ? "انتهى هذا البرنامج" : "This programme has ended"}
                </Badge>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
