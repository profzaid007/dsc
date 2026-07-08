"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useLang } from "@/lib/lang-context"
import { trainingProgramsCollection } from "@/lib/pb-training"
import { casesCollection } from "@/lib/pb-collections"
import pb, { authWithPassword, handlePocketBaseError } from "@/lib/pb"
import { useAuth } from "@/hooks/useAuth"
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
  AlertCircle,
  CheckCircle,
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

interface EnrollmentFormState {
  name: string
  email: string
  password: string
  confirmPassword: string
  contactNumber: string
  dateOfBirth: string
  gender: "male" | "female"
  grade: string
  notes: string
}

const initialEnrollmentForm: EnrollmentFormState = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  contactNumber: "",
  dateOfBirth: "",
  gender: "male",
  grade: "",
  notes: "",
}

export default function TrainingProgrammeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { lang } = useLang()
  const { currentUser } = useAuth()
  const [program, setProgram] = useState<TrainingProgram | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [enrolledCaseId, setEnrolledCaseId] = useState<string | null>(null)
  const [enrollError, setEnrollError] = useState<string>("")
  const [enrollSuccess, setEnrollSuccess] = useState<string>("")
  const [isEnrolleeChecking, setIsEnrolleeChecking] = useState(true)
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [enrollForm, setEnrollForm] = useState<EnrollmentFormState>(
    initialEnrollmentForm
  )

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

  useEffect(() => {
    if (!currentUser) {
      setIsEnrolleeChecking(false)
      return
    }
    const checkExisting = async () => {
      try {
        const mine = await casesCollection.getByUser(currentUser.id)
        const existing = mine.find(
          (c) =>
            c.program_id === id && c.service_type === "Attending Training"
        )
        if (existing) {
          setEnrolledCaseId(existing.id)
        }
      } catch (err) {
        console.error("Failed to check existing enrollment:", err)
      } finally {
        setIsEnrolleeChecking(false)
      }
    }
    checkExisting()
  }, [currentUser, id])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(lang === "ar" ? "ar-AE" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const validateEnrollmentForm = (): string | null => {
    if (!enrollForm.name.trim()) {
      return lang === "ar" ? "الاسم مطلوب" : "Name is required"
    }
    if (!enrollForm.email.trim()) {
      return lang === "ar" ? "البريد الإلكتروني مطلوب" : "Email is required"
    }
    if (!enrollForm.password) {
      return lang === "ar" ? "كلمة المرور مطلوبة" : "Password is required"
    }
    if (enrollForm.password !== enrollForm.confirmPassword) {
      return lang === "ar"
        ? "كلمات المرور غير متطابقة"
        : "Passwords do not match"
    }
    if (enrollForm.password.length < 8) {
      return lang === "ar"
        ? "كلمة المرور قصيرة جداً (8 أحرف على الأقل)"
        : "Password is too short (min 8 characters)"
    }
    return null
  }

  const handleEnrollAsGuest = async () => {
    setEnrollError("")
    setEnrollSuccess("")

    const validationError = validateEnrollmentForm()
    if (validationError) {
      setEnrollError(validationError)
      return
    }

    if (!program) return

    setIsEnrolling(true)
    try {
      const user = await pb.collection("users").create({
        email: enrollForm.email.toLowerCase(),
        password: enrollForm.password,
        passwordConfirm: enrollForm.password,
        name: enrollForm.name,
        contact_number: enrollForm.contactNumber,
        role: "individual",
      })

      await casesCollection.create({
        user: user.id,
        name: program.title[lang],
        service_type: "Attending Training",
        portal_type: "training",
        training_link: program.meetingLink || "",
        program_id: id,
        program_status: "enrolled",
        user_details: {
          name: enrollForm.name,
          email: enrollForm.email,
          contact: enrollForm.contactNumber,
        },
      })

      await authWithPassword(enrollForm.email.toLowerCase(), enrollForm.password)

      setEnrollSuccess(
        lang === "ar"
          ? "تم التسجيل بنجاح! مرحباً بك."
          : "Enrollment successful! Welcome."
      )
      setEnrollForm(initialEnrollmentForm)
    } catch (err) {
      setEnrollError(handlePocketBaseError(err))
    } finally {
      setIsEnrolling(false)
    }
  }

  const handleEnrollAsUser = async () => {
    if (!currentUser) return
    if (!program) return
    setEnrollError("")
    setEnrollSuccess("")
    setIsEnrolling(true)
    try {
      const created = await casesCollection.create({
        user: currentUser.id,
        name: program.title[lang],
        service_type: "Attending Training",
        portal_type: "training",
        training_link: program.meetingLink || "",
        program_id: id,
        program_status: "enrolled",
        user_details: {
          name: currentUser.name,
          email: currentUser.email,
          contact: currentUser.contact_number,
        },
      })
      setEnrolledCaseId(created.id)
      setEnrollSuccess(
        lang === "ar"
          ? "تم التسجيل بنجاح!"
          : "You have been enrolled successfully!"
      )
    } catch (err) {
      setEnrollError(handlePocketBaseError(err))
    } finally {
      setIsEnrolling(false)
    }
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
  const isFull = !!(
    program.maxParticipants &&
    program.currentRegistrations >= program.maxParticipants
  )

  const renderEnrollmentCard = () => {
    if (isPast) {
      return (
        <Card>
          <CardContent className="pt-6">
            <Badge variant="secondary" className="w-full justify-center py-2">
              {lang === "ar"
                ? "انتهى هذا البرنامج"
                : "This programme has ended"}
            </Badge>
          </CardContent>
        </Card>
      )
    }

    if (isFull) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>
              {lang === "ar" ? "التسجيل" : "Enrollment"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {lang === "ar"
                  ? "عذراً، هذا البرنامج ممتلئ."
                  : "Sorry, this programme is full."}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )
    }

    if (isEnrolleeChecking) {
      return (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              {lang === "ar" ? "جاري التحقق..." : "Checking..."}
            </p>
          </CardContent>
        </Card>
      )
    }

    if (enrolledCaseId || enrollSuccess) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>
              {lang === "ar" ? "حالة التسجيل" : "Enrollment Status"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                {enrollSuccess ||
                  (lang === "ar"
                    ? "أنت مسجل في هذا البرنامج."
                    : "You are enrolled in this programme.")}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )
    }

    if (currentUser) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>
              {lang === "ar" ? "التسجيل في البرنامج" : "Enroll in this programme"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {lang === "ar"
                ? `مرحباً ${currentUser.name}، انقر أدناه للتسجيل في هذا البرنامج.`
                : `Hi ${currentUser.name}, click below to enroll in this programme.`}
            </p>
            {enrollError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{enrollError}</AlertDescription>
              </Alert>
            )}
            <Button
              className="w-full"
              disabled={isEnrolling}
              onClick={handleEnrollAsUser}
            >
              {isEnrolling
                ? lang === "ar"
                  ? "جاري التسجيل..."
                  : "Enrolling..."
                : lang === "ar"
                  ? "تأكيد التسجيل"
                  : "Confirm Enrollment"}
            </Button>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {lang === "ar"
              ? "التسجيل في البرنامج"
              : "Enroll in this programme"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {lang === "ar"
              ? "سيتم إنشاء حساب لك تلقائياً عند التسجيل."
              : "An account will be created for you upon enrollment."}
          </p>
          {enrollError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{enrollError}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="enroll-name">
              {lang === "ar" ? "الاسم الكامل *" : "Full Name *"}
            </Label>
            <Input
              id="enroll-name"
              value={enrollForm.name}
              onChange={(e) =>
                setEnrollForm({ ...enrollForm, name: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="enroll-email">
              {lang === "ar" ? "البريد الإلكتروني *" : "Email *"}
            </Label>
            <Input
              id="enroll-email"
              type="email"
              value={enrollForm.email}
              onChange={(e) =>
                setEnrollForm({ ...enrollForm, email: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="enroll-contact">
              {lang === "ar" ? "رقم الهاتف" : "Phone Number"}
            </Label>
            <Input
              id="enroll-contact"
              type="tel"
              value={enrollForm.contactNumber}
              onChange={(e) =>
                setEnrollForm({
                  ...enrollForm,
                  contactNumber: e.target.value,
                })
              }
              placeholder={
                lang === "ar" ? "أدخل رقم هاتفك" : "Enter your phone number"
              }
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="enroll-password">
                {lang === "ar" ? "كلمة المرور *" : "Password *"}
              </Label>
              <Input
                id="enroll-password"
                type="password"
                value={enrollForm.password}
                onChange={(e) =>
                  setEnrollForm({ ...enrollForm, password: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="enroll-confirm">
                {lang === "ar" ? "تأكيد كلمة المرور *" : "Confirm Password *"}
              </Label>
              <Input
                id="enroll-confirm"
                type="password"
                value={enrollForm.confirmPassword}
                onChange={(e) =>
                  setEnrollForm({
                    ...enrollForm,
                    confirmPassword: e.target.value,
                  })
                }
                required
              />
            </div>
          </div>

          <Button
            className="w-full"
            disabled={isEnrolling}
            onClick={handleEnrollAsGuest}
          >
            {isEnrolling
              ? lang === "ar"
                ? "جاري التسجيل..."
                : "Enrolling..."
              : lang === "ar"
                ? "إنشاء حساب والتسجيل"
                : "Create Account & Enroll"}
          </Button>
        </CardContent>
      </Card>
    )
  }

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

          {renderEnrollmentCard()}
        </div>
      </div>
    </div>
  )
}
