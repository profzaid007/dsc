"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useLectures } from "@/hooks/useLectures"
import { RegistrationForm } from "@/components/lectures"
import { useAuth } from "@/hooks/useAuth"
import { useLang } from "@/lib/lang-context"
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  ExternalLink,
  User,
  Briefcase,
} from "lucide-react"

export default function LectureDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { lang } = useLang()
  const { currentUser } = useAuth()
  const {
    getLectureById,
    registerForLecture,
    getUserRegistration,
    isLectureFull,
    isLoading,
  } = useLectures()

  const lecture = getLectureById(id)
  const isRegistered = currentUser
    ? !!getUserRegistration(id, currentUser.id)
    : false
  const isFull = isLectureFull(id)

  const handleRegister = async (data: {
    userName: string
    email: string
    phone?: string
  }) => {
    if (!currentUser) {
      router.push("/login")
      return
    }

    await registerForLecture(id, {
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

  if (!lecture) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-xl font-semibold">
          {lang === "ar" ? "المحاضرة غير موجودة" : "Lecture not found"}
        </h2>
        <Button
          variant="link"
          onClick={() => router.push("/dashboard/public-lectures")}
        >
          {lang === "ar" ? "العودة إلى المحاضرات" : "Back to lectures"}
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString(lang === "ar" ? "ar-AE" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const isPast = new Date(lecture.dateTime) < new Date()

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => router.push("/dashboard/public-lectures")}
      >
        <ArrowLeft className="me-2 h-4 w-4" />
        {lang === "ar" ? "العودة إلى المحاضرات" : "Back to lectures"}
      </Button>

      {/* Hero Section */}
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
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h1 className="mb-2 text-3xl font-bold">{lecture.title[lang]}</h1>
            <p className="text-lg text-white/90">{lecture.speaker}</p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {!lecture.thumbnail && (
            <Card>
              <CardHeader>
                <h1 className="text-3xl font-bold">{lecture.title[lang]}</h1>
                <p className="text-lg text-muted-foreground">
                  {lecture.speaker}
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
              <p className="text-muted-foreground leading-relaxed">
                {lecture.description[lang]}
              </p>
            </CardContent>
          </Card>

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
                  <h3 className="text-lg font-semibold">{lecture.speaker}</h3>
                  {lecture.speakerRole && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Briefcase className="h-4 w-4" />
                      <span>{lecture.speakerRole}</span>
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
                {lang === "ar" ? "تفاصيل المحاضرة" : "Lecture Details"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{formatDate(lecture.dateTime)}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatTime(lecture.dateTime)}
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
                  <p className="font-medium">{lecture.location}</p>
                </div>
              </div>

              {lecture.maxParticipants && (
                <>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {lang === "ar" ? "الحد الأقصى:" : "Max participants:"}{" "}
                        {lecture.maxParticipants}
                      </p>
                    </div>
                  </div>
                </>
              )}

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
            </CardContent>
          </Card>

          {!isPast && (
            <RegistrationForm
              onSubmit={handleRegister}
              isFull={isFull}
              isAlreadyRegistered={isRegistered}
            />
          )}

          {isPast && (
            <Card>
              <CardContent className="pt-6">
                <Badge variant="secondary" className="w-full justify-center py-2">
                  {lang === "ar" ? "انتهت هذه المحاضرة" : "This lecture has ended"}
                </Badge>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
