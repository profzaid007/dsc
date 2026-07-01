"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useTraining } from "@/hooks/useTraining"
import { RegistrationForm } from "@/components/training"
import { useAuth } from "@/hooks/useAuth"
import { useLang } from "@/lib/lang-context"
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Presentation,
  User,
  Briefcase,
  CheckCircle,
} from "lucide-react"

export default function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { lang } = useLang()
  const { currentUser } = useAuth()
  const {
    getSessionById,
    registerForSession,
    getUserSessionRegistration,
    isSessionFull,
    isSessionPast,
    isLoading,
  } = useTraining()

  const session = getSessionById(id)
  const isRegistered = currentUser && session
    ? !!getUserSessionRegistration(id, currentUser.id)
    : false
  const isFull = isSessionFull(id)
  const isPast = isSessionPast(id)

  const handleRegister = async (data: {
    userName: string
    email: string
    phone?: string
  }) => {
    if (!currentUser) {
      router.push("/login")
      return
    }

    await registerForSession(id, {
      userId: currentUser.id,
      ...data,
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">
          {lang === "ar" ? "جاري التحميل..." : "Loading..."}
        </p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-xl font-semibold">
          {lang === "ar" ? "الجلسة غير موجودة" : "Session not found"}
        </h2>
        <Button
          variant="link"
          onClick={() => router.push("/dashboard/training/sessions")}
        >
          {lang === "ar" ? "العودة إلى الجلسات" : "Back to sessions"}
        </Button>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(lang === "ar" ? "ar-AE" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const typeLabels = {
    online: { en: "Online", ar: "عبر الإنترنت" },
    in_person: { en: "In-Person", ar: "حضوري" },
    hybrid: { en: "Hybrid", ar: "مختلط" },
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => router.push("/dashboard/training/sessions")}
      >
        <ArrowLeft className="me-2 h-4 w-4" />
        {lang === "ar" ? "العودة إلى الجلسات" : "Back to sessions"}
      </Button>

      {/* Hero Section */}
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
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
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
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Briefcase className="h-4 w-4" />
                      <span>{session.speaker.role[lang]}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
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
                  <p className="text-sm text-muted-foreground">
                    {lang === "ar" ? "المدة" : "Duration"}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <Presentation className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{typeLabels[session.type][lang]}</p>
                  <p className="text-sm text-muted-foreground">
                    {lang === "ar" ? "النوع" : "Type"}
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
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {lang === "ar" ? "الجمهور المستهدف:" : "Target:" }{ " "}
                    {session.targetAudience[lang]}
                  </p>
                </div>
              </div>

              {session.maxParticipants && (
                <>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {lang === "ar" ? "الحد الأقصى:" : "Max:" }{ " "}
                        {session.maxParticipants}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {lang === "ar" ? "المتبقي:" : "Spots left:" }{ " "}
                        {session.maxParticipants - session.currentRegistrations}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {session.coordinator && (
                <>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{session.coordinator}</p>
                      <p className="text-sm text-muted-foreground">
                        {lang === "ar" ? "المنسق" : "Coordinator"}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {isRegistered && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">
                      {lang === "ar"
                        ? "أنت مسجل في هذه الجلسة"
                        : "You are registered for this session"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {!isPast && !isRegistered && (
            <RegistrationForm
              onSubmit={handleRegister}
              isFull={isFull}
              isAlreadyRegistered={isRegistered}
              title={
                lang === "ar"
                  ? "التسجيل في الجلسة"
                  : "Register for Session"
              }
            />
          )}

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
