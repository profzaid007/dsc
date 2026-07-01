"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useTraining } from "@/hooks/useTraining"
import { RegistrationForm, CertificateCard } from "@/components/training"
import { useAuth } from "@/hooks/useAuth"
import { useLang } from "@/lib/lang-context"
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  BookOpen,
  User,
  Briefcase,
  Award,
  CheckCircle,
} from "lucide-react"

export default function ProgramDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { lang } = useLang()
  const { currentUser } = useAuth()
  const {
    getProgramById,
    registerForProgram,
    getUserProgramRegistration,
    getCertificateById,
    isProgramFull,
    isProgramPast,
    isLoading,
  } = useTraining()

  const program = getProgramById(id)
  const isRegistered = currentUser && program
    ? !!getUserProgramRegistration(id, currentUser.id)
    : false
  const isFull = isProgramFull(id)
  const isPast = isProgramPast(id)

  const registration = isRegistered && currentUser
    ? getUserProgramRegistration(id, currentUser.id)
    : null

  const certificate = registration?.certificateId
    ? getCertificateById(registration.certificateId)
    : null

  const handleRegister = async (data: {
    userName: string
    email: string
    phone?: string
  }) => {
    if (!currentUser) {
      router.push("/login")
      return
    }

    await registerForProgram(id, {
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

  if (!program) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-xl font-semibold">
          {lang === "ar" ? "البرنامج غير موجود" : "Program not found"}
        </h2>
        <Button
          variant="link"
          onClick={() => router.push("/dashboard/training")}
        >
          {lang === "ar" ? "العودة إلى البرامج" : "Back to programs"}
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
        onClick={() => router.push("/dashboard/training")}
      >
        <ArrowLeft className="me-2 h-4 w-4" />
        {lang === "ar" ? "العودة إلى البرامج" : "Back to programs"}
      </Button>

      {/* Hero Section */}
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
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
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

          <Card>
            <CardHeader>
              <CardTitle>
                {lang === "ar" ? "جدول البرنامج" : "Program Schedule"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {formatDate(program.schedule.startDate)} -{" "}
                  {formatDate(program.schedule.endDate)}
                </span>
              </div>
              <div className="space-y-3">
                {program.schedule.sessions.map((session, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 rounded-md border p-3"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <span className="text-sm font-semibold">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {formatDate(session.date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {session.timeFrom} - {session.timeTo}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {session.location}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

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
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Briefcase className="h-4 w-4" />
                      <span>{program.trainer.role[lang]}</span>
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
                {lang === "ar" ? "تفاصيل البرنامج" : "Program Details"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {formatDate(program.schedule.startDate)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {lang === "ar" ? "تاريخ البدء" : "Start Date"}
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
                  <p className="text-sm text-muted-foreground">
                    {lang === "ar" ? "المدة" : "Duration"}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{program.category[lang]}</p>
                  <p className="text-sm text-muted-foreground">
                    {lang === "ar" ? "الفئة" : "Category"}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{program.location}</p>
                  <p className="text-sm text-muted-foreground">
                    {typeLabels[program.type][lang]}
                  </p>
                </div>
              </div>

              {program.maxParticipants && (
                <>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {lang === "ar" ? "الحد الأقصى:" : "Max:"}{" "}
                        {program.maxParticipants}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {lang === "ar" ? "المتبقي:" : "Spots left:"}{" "}
                        {program.maxParticipants - program.currentRegistrations}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {program.coordinator && (
                <>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{program.coordinator}</p>
                      <p className="text-sm text-muted-foreground">
                        {lang === "ar" ? "المنسق" : "Coordinator"}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {isRegistered && certificate && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {lang === "ar" ? "شهادتك" : "Your Certificate"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CertificateCard certificate={certificate} />
              </CardContent>
            </Card>
          )}

          {isRegistered && !certificate && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">
                      {lang === "ar"
                        ? "أنت مسجل في هذا البرنامج"
                        : "You are registered for this program"}
                    </p>
                    {program.status === "completed" && (
                      <p className="text-sm text-muted-foreground">
                        {lang === "ar"
                          ? "في انتظار الشهادة..."
                          : "Certificate pending..."}
                      </p>
                    )}
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
            />
          )}

          {isPast && (
            <Card>
              <CardContent className="pt-6">
                <Badge variant="secondary" className="w-full justify-center py-2">
                  {lang === "ar" ? "انتهى هذا البرنامج" : "This program has ended"}
                </Badge>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
