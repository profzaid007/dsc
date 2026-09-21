"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { EmailInput } from "@/components/ui/email-input"
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { t } from "@/lib/i18n"
import { useLang } from "@/lib/lang-context"
import { COUNTRY_CODES } from "@/lib/country-codes"
import { LANGUAGES } from "@/lib/language-list"
import pb, { getErrorMessage, getFieldErrors } from "@/lib/pb"
import { Check, ChevronsUpDown, Paperclip, X } from "lucide-react"
import {
  EMAIL_INVALID_MESSAGE,
  isValidEmail,
  normalizeEmail,
} from "@/lib/validators"
import { toast } from "sonner"

function humanize(value: string): string {
  return value
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

const AGE_GROUPS = [
  "0-3",
  "4-6",
  "7-12",
  "13-17",
  "18-25",
  "26-40",
  "41-60",
  "60+",
  "all_ages",
].map((value) => ({ value, label: humanize(value) }))

const SPECIALIZATIONS = [
  "assessment_and_diagnosis",
  "consultation",
  "therapy_and_intervention",
  "educational_support",
  "research_and_statistics",
  "academic_supervision",
  "training_and_workshops",
  "curriculum_development",
  "program_development",
  "psychological_services",
  "special_education",
  "speech_and_language_services",
  "occupational_therapy",
  "behavioral_services",
  "career_and_vocational_guidance",
  "technology_and_digital_solutions",
  "translation_and_content_services",
  "institutional_and_organizational_consulting",
  "other",
].map((value) => ({ value, label: humanize(value) }))

const CLIENT_TYPES = [
  "children",
  "adolescents",
  "adults",
  "parents_and_families",
  "students",
  "teachers_and_educators",
  "researchers_and_academics",
  "schools_and_educational_institutions",
  "universities_and_higher_education_institutions",
  "healthcare_professionals_and_institutions",
  "organizations_and_ngos",
  "businesses_and_companies",
  "government_institutions",
  "other",
].map((value) => ({ value, label: humanize(value) }))

const CONSULTATION_MODES = [
  "online",
  "at_dsc",
  "home_visit",
  "client_institution",
  "hybrid",
].map((value) => ({ value, label: humanize(value) }))

const ACADEMIC_DEGREES = [
  { value: "high_school_secondary", label: "High School / Secondary" },
  { value: "diploma", label: "Diploma" },
  { value: "associate_degree", label: "Associate Degree" },
  { value: "bachelors_degree", label: "Bachelor's Degree" },
  { value: "masters_degree", label: "Master's Degree" },
  { value: "doctorate_phd", label: "Doctorate (PhD)" },
  { value: "professional_degree", label: "Professional Degree" },
  { value: "postdoctoral_fellowship", label: "Postdoctoral / Fellowship" },
  { value: "other", label: "Other" },
]

export function ExpertApplicationForm({
  onSuccess,
}: {
  onSuccess?: () => void
} = {}) {
  const { lang } = useLang()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const profilePhotoInputRef = useRef<HTMLInputElement>(null)

  // user fields
  const [name, setName] = useState("")
  const [fullLegalName, setFullLegalName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [countryCode, setCountryCode] = useState("")
  const [contactNumber, setContactNumber] = useState("")

  // Extra fields
  const [nationality, setNationality] = useState("")
  const [residence, setResidence] = useState("")
  const [city, setCity] = useState("")
  const [highestAcademicDegree, setHighestAcademicDegree] = useState("")
  const [degreeTitle, setDegreeTitle] = useState("")
  const [fieldOfStudy, setFieldOfStudy] = useState("")
  const [whatsappCountryCode, setWhatsappCountryCode] = useState("")
  const [whatsappNumber, setWhatsappNumber] = useState("")
  const [preferredLanguages, setPreferredLanguages] = useState<string[]>([])
  const [ageGroup, setAgeGroup] = useState<string[]>([])
  const [specialization, setSpecialization] = useState<string[]>([])
  const [clientType, setClientType] = useState<string[]>([])
  const [consultationMode, setConsultationMode] = useState("")
  const [fee, setFee] = useState("")
  const [availability, setAvailability] = useState("")
  const [message, setMessage] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null)

  // Booleans
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [step, setStep] = useState<1 | 2>(1)

  const passwordTooShort = password.length > 0 && password.length < 8
  const passwordsMismatch =
    passwordConfirm.length > 0 && password !== passwordConfirm

  const fieldErrorNode = (...keys: string[]) => {
    const msg = keys.map((k) => fieldErrors[k]).find(Boolean)
    return msg ? <p className="text-xs text-red-500">{msg}</p> : null
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFiles([file])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleProfilePhotoChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setProfilePhoto(e.target.files?.[0] ?? null)
  }

  const removeProfilePhoto = () => {
    setProfilePhoto(null)
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        const base64 = result.includes(",") ? result.split(",")[1] : result
        resolve(base64)
      }
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(file)
    })
  }

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    const required = t(
      { en: "This field is required.", ar: "هذا الحقل مطلوب." },
      lang
    )

    if (!name.trim()) errs.name = required
    if (!contactNumber.trim()) errs.contactNumber = required
    if (!email.trim()) errs.email = required
    else if (!isValidEmail(email)) errs.email = t(EMAIL_INVALID_MESSAGE, lang)
    if (!password) errs.password = required
    else if (password.length < 8)
      errs.password = t(
        {
          en: "Password must be at least 8 characters.",
          ar: "يجب أن تكون كلمة المرور 8 أحرف على الأقل.",
        },
        lang
      )
    if (!passwordConfirm) errs.passwordConfirm = required
    else if (password !== passwordConfirm)
      errs.passwordConfirm = t(
        { en: "Passwords do not match", ar: "كلمات المرور غير متطابقة" },
        lang
      )

    setFieldErrors(errs)
    if (Object.keys(errs).length > 0) {
      setError("")
      return false
    }
    return true
  }

  const handleNext = () => {
    if (!validate()) return
    window.scrollTo({ 
      top: 0 
    })
    setStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validate()) return

    const totalSize =
      files.reduce((sum, f) => sum + f.size, 0) + (profilePhoto?.size ?? 0)
    if (totalSize > 35 * 1024 * 1024) {
      setError(
        t(
          {
            en: "Total attachment size exceeds 35MB. Please reduce the number or size of files.",
            ar: "يتجاوز الحجم الإجمالي للمرفقات 35 ميجابايت. يرجى تقليل عدد الملفات أو حجمها.",
          },
          lang
        )
      )
      return
    }

    setIsSubmitting(true)

    try {
      const cleanName = name.trim()
      const cleanFullLegalName = fullLegalName.trim()
      const cleanEmail = normalizeEmail(email)
      const cleanContact = `${countryCode} ${contactNumber.trim()}`.trim()

      const emailLabels =
        lang === "ar"
          ? {
              title: "طلب جديد لتسجيل خبير",
              name: "الاسم",
              contactNumber: "رقم التواصل",
              email: "البريد الإلكتروني",
              nationality: "الجنسية",
              residence: "بلد الإقامة",
              city: "المدينة",
              fullLegalName: "الاسم القانوني الكامل",
              highestDegree: "أعلى درجة أكاديمية",
              degreeTitle: "عنوان الدرجة",
              fieldOfStudy: "مجال الدراسة",
              whatsapp: "رقم واتساب",
              preferredLanguages: "اللغات المفضلة",
              ageGroup: "الفئة العمرية",
              specialization: "التخصص",
              clientType: "نوع العميل",
              consultationMode: "طريقة الاستشارة",
              fee: "الرسوم",
              availability: "التوفر",
              message: "الرسالة",
              profilePhoto: "الصورة الشخصية",
              attachments: "المرفقات",
              subjectPrefix: "طلب خبير من:",
            }
          : {
              title: "New Expert Application",
              name: "Name",
              contactNumber: "Contact Number",
              email: "Email",
              nationality: "Nationality",
              residence: "Country of Residence",
              city: "City",
              fullLegalName: "Full Legal Name",
              highestDegree: "Highest Academic Degree",
              degreeTitle: "Degree Title",
              fieldOfStudy: "Field of Study",
              whatsapp: "WhatsApp Number",
              preferredLanguages: "Preferred Languages",
              ageGroup: "Age Group",
              specialization: "Specialization",
              clientType: "Client Type",
              consultationMode: "Consultation Mode",
              fee: "Fee",
              availability: "Availability",
              message: "Message",
              profilePhoto: "Profile Photo",
              attachments: "Attachments",
              subjectPrefix: "Expert application from:",
            }

      const html = [
        `<h2>${emailLabels.title}</h2>`,
        `<p><strong>${emailLabels.name}:</strong> ${cleanName}</p>`,
        `<p><strong>${emailLabels.contactNumber}:</strong> ${cleanContact}</p>`,
        `<p><strong>${emailLabels.email}:</strong> ${cleanEmail}</p>`,
        nationality ? `<p><strong>${emailLabels.nationality}:</strong> ${nationality}</p>` : "",
        residence ? `<p><strong>${emailLabels.residence}:</strong> ${residence}</p>` : "",
        city ? `<p><strong>${emailLabels.city}:</strong> ${city}</p>` : "",
        fullLegalName ? `<p><strong>${emailLabels.fullLegalName}:</strong> ${cleanFullLegalName}</p>` : "",
        highestAcademicDegree ? `<p><strong>${emailLabels.highestDegree}:</strong> ${ACADEMIC_DEGREES.find((o) => o.value === highestAcademicDegree)?.label ?? highestAcademicDegree}</p>` : "",
        degreeTitle ? `<p><strong>${emailLabels.degreeTitle}:</strong> ${degreeTitle}</p>` : "",
        fieldOfStudy ? `<p><strong>${emailLabels.fieldOfStudy}:</strong> ${fieldOfStudy}</p>` : "",
        whatsappNumber ? `<p><strong>${emailLabels.whatsapp}:</strong> ${whatsappCountryCode} ${whatsappNumber}</p>` : "",
        preferredLanguages.length ? `<p><strong>${emailLabels.preferredLanguages}:</strong> ${preferredLanguages.join(", ")}</p>` : "",
        ageGroup.length ? `<p><strong>${emailLabels.ageGroup}:</strong> ${AGE_GROUPS.filter((o) => ageGroup.includes(o.value)).map((o) => o.label).join(", ")}</p>` : "",
        specialization.length ? `<p><strong>${emailLabels.specialization}:</strong> ${SPECIALIZATIONS.filter((o) => specialization.includes(o.value)).map((o) => o.label).join(", ")}</p>` : "",
        clientType.length ? `<p><strong>${emailLabels.clientType}:</strong> ${CLIENT_TYPES.filter((o) => clientType.includes(o.value)).map((o) => o.label).join(", ")}</p>` : "",
        consultationMode ? `<p><strong>${emailLabels.consultationMode}:</strong> ${CONSULTATION_MODES.find((o) => o.value === consultationMode)?.label ?? consultationMode}</p>` : "",
        fee ? `<p><strong>${emailLabels.fee}:</strong> ${fee}</p>` : "",
        availability ? `<p><strong>${emailLabels.availability}:</strong> ${availability}</p>` : "",
        message ? `<p><strong>${emailLabels.message}:</strong><br/>${message}</p>` : "",
        profilePhoto ? `<p><strong>${emailLabels.profilePhoto}:</strong> ${profilePhoto.name}</p>` : "",
        files.length ? `<p><strong>${emailLabels.attachments}:</strong> ${files.map((f) => f.name).join(", ")}</p>` : "",
      ].join("\n")

      const userFormData = new FormData()
      const extraFormData = new FormData()

      // User Form
      userFormData.set("email", cleanEmail)
      userFormData.set("emailVisibility", "true")
      userFormData.set("password", password)
      userFormData.set("passwordConfirm", passwordConfirm)
      userFormData.set("name", cleanName)
      userFormData.set("role", "expert")
      userFormData.set("contact_number", cleanContact)
      userFormData.set("is_active", "false")

      // Create user record
      const user = await pb.collection("users").create(userFormData)

      // Extra fields
      extraFormData.set("user", user.id)
      extraFormData.set("full_legal_name", cleanFullLegalName)
      if (profilePhoto) extraFormData.append("profile_photo", profilePhoto)

      extraFormData.set("nationality", nationality)
      extraFormData.set("country_of_residence", residence)
      extraFormData.set("city", city)
      extraFormData.set("whatsapp_country_code", whatsappCountryCode)
      extraFormData.set("whatsapp_number",whatsappNumber)
      extraFormData.set("highest_academic_degree", highestAcademicDegree)
      extraFormData.set("degree_title", degreeTitle)
      extraFormData.set("field_of_study", fieldOfStudy)

      ageGroup.forEach((v) => extraFormData.append("age_group", v))
      specialization.forEach((v) => extraFormData.append("specialization_type", v))
      clientType.forEach((v) => extraFormData.append("client_type", v))
      extraFormData.set("consultation_mode", consultationMode)
      extraFormData.set("preferred_languages", preferredLanguages.join(", "))

      files.forEach((file) => extraFormData.append("cv", file))

      extraFormData.set("bio", message)
      extraFormData.set("availability", availability)
      extraFormData.set("fee", fee)

      // Create extra record
      await pb.collection("expert_profiles").create(extraFormData)

      let attachments: { filename: string; content: string }[] = []
      if (files.length > 0) {
        attachments = await Promise.all(
          files.map(async (file) => ({
            filename: file.name,
            content: await fileToBase64(file),
          }))
        )
      }

      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "admin@dsc.ac",
          to: cleanEmail,
          cc: "admin@dsc.ac",
          subject: `${emailLabels.subjectPrefix} ${cleanName}`,
          html,
          attachments,
        }),
      })

      toast.success(
        t(
          {
            en: "Application submitted successfully.",
            ar: "تم إرسال الطلب بنجاح.",
          },
          lang
        )
      )

      if (onSuccess) {
        onSuccess()
      } else if (!response.ok) {
        router.push("/login?expert_pending=1&warn=1")
      } else {
        router.push("/login?expert_pending=1")
      }
    } catch (err) {
      const fieldErrs = getFieldErrors(err, lang)
      if (Object.keys(fieldErrs).length > 0) {
        setFieldErrors(fieldErrs)
        setStep(1)
      } else {
        setError(getErrorMessage(err, lang))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <Card>
        <CardHeader>
          <CardTitle>
            {step === 1
              ? t(
                { en: "Personal Information", ar: "المعلومات الشخصية" },
                lang
              )
              : t(
                { en: "Client Preferences", ar: "تفضيلات العميل" },
                lang
              )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {step === 1 && (
            <>
          <div className="space-y-2">
            <Label>
              {t({ en: "Full Name", ar: "الاسم الكامل" }, lang)}
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              aria-invalid={fieldErrors.name ? true : undefined}
              placeholder={t(
                { en: "e.g. Dr. Ahmed Al-Rashid", ar: "مثال: د. أحمد الراشد" },
                lang
              )}
            />
            {fieldErrorNode("name")}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                {t({ en: "Nationality", ar: "الجنسية" }, lang)}
              </Label>
              <Select value={nationality} onValueChange={setNationality}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t({ en: "Select nationality...", ar: "اختر الجنسية..." }, lang)} />
                </SelectTrigger>
                <SelectContent position="popper" className="max-h-60!">
                  {COUNTRY_CODES.map((c) => (
                    <SelectItem key={c.value} value={c.label.en}>
                      {t(c.label, lang)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                {t({ en: "Country of Residence", ar: "بلد الإقامة" }, lang)}
              </Label>
              <Select value={residence} onValueChange={setResidence}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t({ en: "Select country of residence...", ar: "اختر بلد الإقامة..." }, lang)} />
                </SelectTrigger>
                <SelectContent position="popper" className="max-h-60!">
                  {COUNTRY_CODES.map((c) => (
                    <SelectItem key={c.value} value={c.label.en}>
                      {t(c.label, lang)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                {t({ en: "City", ar: "المدينة" }, lang)}
              </Label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder={t(
                  { en: "e.g. Riyadh", ar: "مثال: الرياض" },
                  lang
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                {t({ en: "Highest Academic Degree", ar: "أعلى مؤهل أكاديمي" }, lang)}
              </Label>
              <Select
                value={highestAcademicDegree}
                onValueChange={setHighestAcademicDegree}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={t(
                      { en: "Select degree...", ar: "اختر المؤهل..." },
                      lang
                    )}
                  />
                </SelectTrigger>
                <SelectContent position="popper" className="max-h-60!">
                  {ACADEMIC_DEGREES.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                {t({ en: "Degree Title", ar: "عنوان الشهادة" }, lang)}
              </Label>
              <Input
                value={degreeTitle}
                onChange={(e) => setDegreeTitle(e.target.value)}
                placeholder={t(
                  { en: "e.g. Bachelor of Education", ar: "مثال: بكالوريوس تربية" },
                  lang
                )}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>
                {t({ en: "Field of Study", ar: "مجال الدراسة" }, lang)}
              </Label>
              <Input
                value={fieldOfStudy}
                onChange={(e) => setFieldOfStudy(e.target.value)}
                placeholder={t(
                  { en: "e.g. Special Education", ar: "مثال: التربية الخاصة" },
                  lang
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                {t({ en: "Contact Number", ar: "رقم التواصل" }, lang)}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <div className="flex gap-2">
                <Select value={countryCode} onValueChange={setCountryCode}>
                  <SelectTrigger className="w-30">
                    <SelectValue placeholder="+966" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="max-h-60! max-w-30">
                    {COUNTRY_CODES.map((c) => (
                      <SelectItem key={c.value} value={c.dialCode}>
                        {t(c.label, lang)} ({c.dialCode})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="tel"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  autoComplete="tel"
                  inputMode="tel"
                  aria-invalid={
                    fieldErrors.contactNumber || fieldErrors.contact_number
                      ? true
                      : undefined
                  }
                  placeholder={t(
                    { en: "e.g. 50 000 0000", ar: "مثال: 50 000 0000" },
                    lang
                  )}
                  className="flex-1"
                />
              </div>
              {fieldErrorNode("contactNumber", "contact_number")}
            </div>

            <div className="space-y-2">
              <Label>
                {t({ en: "Email", ar: "البريد الإلكتروني" }, lang)}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <EmailInput
                value={email}
                onChange={setEmail}
                error={fieldErrors.email}
                placeholder="your@email.com"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>
                {t({ en: "WhatsApp Number", ar: "رقم الواتساب" }, lang)}
              </Label>
              <div className="flex gap-2">
                <Select
                  value={whatsappCountryCode}
                  onValueChange={setWhatsappCountryCode}
                >
                  <SelectTrigger className="w-30">
                    <SelectValue placeholder="+966" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="max-h-60! max-w-30">
                    {COUNTRY_CODES.map((c) => (
                      <SelectItem key={c.value} value={c.dialCode}>
                        {t(c.label, lang)} ({c.dialCode})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="tel"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder={t(
                    { en: "e.g. 55 000 0000", ar: "مثال: 55 000 0000" },
                    lang
                  )}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                {t({ en: "Password", ar: "كلمة المرور" }, lang)}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={fieldErrors.password ? true : undefined}
                placeholder={t(
                  { en: "Min 8 characters", ar: "8 أحرف على الأقل" },
                  lang
                )}
              />
              <p className="text-xs text-muted-foreground">
                {t(
                  { en: "Minimum 8 characters", ar: "8 أحرف على الأقل" },
                  lang
                )}
              </p>
              {fieldErrorNode("password")}
              {!fieldErrors.password && passwordTooShort && (
                <p className="text-xs text-red-500">
                  {t(
                    {
                      en: "Password must be at least 8 characters",
                      ar: "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل",
                    },
                    lang
                  )}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>
                {t({ en: "Confirm Password", ar: "تأكيد كلمة المرور" }, lang)}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <PasswordInput
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                aria-invalid={fieldErrors.passwordConfirm ? true : undefined}
                placeholder={t(
                  { en: "Re-enter your password", ar: "أعد إدخال كلمة المرور" },
                  lang
                )}
              />
              {fieldErrorNode("passwordConfirm")}
              {!fieldErrors.passwordConfirm && passwordsMismatch && (
                <p className="text-xs text-red-500">
                  {t(
                    { en: "Passwords do not match", ar: "كلمتا المرور غير متطابقتين" },
                    lang
                  )}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              {t({ en: "Preferred Languages", ar: "اللغات المفضلة" }, lang)}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between h-auto min-h-10"
                >
                  <div className="flex flex-wrap gap-1">
                    {preferredLanguages.length > 0 ? (
                      preferredLanguages.map((langValue) => {
                        const langOption = LANGUAGES.find((l) => l.value === langValue)
                        return (
                          <Badge
                            key={langValue}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {langOption ? t(langOption.label, lang) : langValue}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation()
                                setPreferredLanguages(
                                  preferredLanguages.filter((l) => l !== langValue)
                                )
                              }}
                            />
                          </Badge>
                        )
                      })
                    ) : (
                      <span className="text-muted-foreground">
                        {t(
                          { en: "Select languages...", ar: "اختر اللغات..." },
                          lang
                        )}
                      </span>
                    )}
                  </div>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0" align="start">
                <Command>
                  <CommandInput placeholder={t({ en: "Search languages...", ar: "البحث عن اللغات..." }, lang)} />
                  <CommandList>
                    <CommandEmpty>
                      {t({ en: "No language found.", ar: "لم يتم العثور على لغة." }, lang)}
                    </CommandEmpty>
                    <CommandGroup>
                      {LANGUAGES.map((langOption) => (
                        <CommandItem
                          key={langOption.value}
                          value={langOption.value}
                          onSelect={() => {
                            setPreferredLanguages(
                              preferredLanguages.includes(langOption.value)
                                ? preferredLanguages.filter((l) => l !== langOption.value)
                                : [...preferredLanguages, langOption.value]
                            )
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              preferredLanguages.includes(langOption.value)
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {t(langOption.label, lang)}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <Button type="button" className="p-4 w-full" onClick={handleNext}>
            {t({ en: "Next", ar: "التالي" }, lang)}
          </Button>
            </>
          )}

          {step === 2 && (
            <>
          <div className="space-y-2">
            <Label>
              {t({ en: "Full Legal Name", ar: "الاسم القانوني الكامل" }, lang)}
            </Label>
            <Input
              value={fullLegalName}
              onChange={(e) => setFullLegalName(e.target.value)}
              placeholder={t(
                { en: "e.g. Mohammed Abdullah Al-Rashid", ar: "مثال: محمد عبدالله الراشد" },
                lang
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                {t({ en: "Age Group", ar: "الفئة العمرية" }, lang)}
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between h-auto min-h-10"
                  >
                    <div className="flex flex-wrap gap-1">
                      {ageGroup.length > 0 ? (
                        ageGroup.map((value) => {
                          const option = AGE_GROUPS.find((o) => o.value === value)
                          return (
                            <Badge
                              key={value}
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              {option ? option.label : value}
                              <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setAgeGroup(ageGroup.filter((v) => v !== value))
                                }}
                              />
                            </Badge>
                          )
                        })
                      ) : (
                        <span className="text-muted-foreground">
                          {t({ en: "Select age groups...", ar: "اختر الفئات العمرية..." }, lang)}
                        </span>
                      )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder={t({ en: "Search age groups...", ar: "البحث عن الفئات..." }, lang)} />
                    <CommandList>
                      <CommandEmpty>
                        {t({ en: "No age group found.", ar: "لم يتم العثور على فئة." }, lang)}
                      </CommandEmpty>
                      <CommandGroup>
                        {AGE_GROUPS.map((option) => (
                          <CommandItem
                            key={option.value}
                            value={option.value}
                            onSelect={() => {
                              setAgeGroup(
                                ageGroup.includes(option.value)
                                  ? ageGroup.filter((v) => v !== option.value)
                                  : [...ageGroup, option.value]
                              )
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                ageGroup.includes(option.value) ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {option.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>
                {t({ en: "Consultation Mode", ar: "وضع الاستشارة" }, lang)}
              </Label>
              <Select value={consultationMode} onValueChange={setConsultationMode}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t({ en: "Select mode...", ar: "اختر الوضع..." }, lang)} />
                </SelectTrigger>
                <SelectContent position="popper" className="max-h-60!">
                  {CONSULTATION_MODES.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              {t({ en: "Specialization", ar: "التخصص" }, lang)}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between h-auto min-h-10"
                >
                  <div className="flex flex-wrap gap-1">
                    {specialization.length > 0 ? (
                      specialization.map((value) => {
                        const option = SPECIALIZATIONS.find((o) => o.value === value)
                        return (
                          <Badge
                            key={value}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {option ? option.label : value}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSpecialization(specialization.filter((v) => v !== value))
                              }}
                            />
                          </Badge>
                        )
                      })
                    ) : (
                      <span className="text-muted-foreground">
                        {t({ en: "Select specializations...", ar: "اختر التخصصات..." }, lang)}
                      </span>
                    )}
                  </div>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0" align="start">
                <Command>
                  <CommandInput placeholder={t({ en: "Search specializations...", ar: "البحث عن التخصصات..." }, lang)} />
                  <CommandList>
                    <CommandEmpty>
                      {t({ en: "No specialization found.", ar: "لم يتم العثور على تخصص." }, lang)}
                    </CommandEmpty>
                    <CommandGroup>
                      {SPECIALIZATIONS.map((option) => (
                        <CommandItem
                          key={option.value}
                          value={option.value}
                          onSelect={() => {
                            setSpecialization(
                              specialization.includes(option.value)
                                ? specialization.filter((v) => v !== option.value)
                                : [...specialization, option.value]
                            )
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              specialization.includes(option.value) ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {option.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>
              {t({ en: "Client Type", ar: "نوع العميل" }, lang)}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between h-auto min-h-10"
                >
                  <div className="flex flex-wrap gap-1">
                    {clientType.length > 0 ? (
                      clientType.map((value) => {
                        const option = CLIENT_TYPES.find((o) => o.value === value)
                        return (
                          <Badge
                            key={value}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {option ? option.label : value}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation()
                                setClientType(clientType.filter((v) => v !== value))
                              }}
                            />
                          </Badge>
                        )
                      })
                    ) : (
                      <span className="text-muted-foreground">
                        {t({ en: "Select client types...", ar: "اختر أنواع العملاء..." }, lang)}
                      </span>
                    )}
                  </div>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0" align="start">
                <Command>
                  <CommandInput placeholder={t({ en: "Search client types...", ar: "البحث عن أنواع العملاء..." }, lang)} />
                  <CommandList>
                    <CommandEmpty>
                      {t({ en: "No client type found.", ar: "لم يتم العثور على نوع عميل." }, lang)}
                    </CommandEmpty>
                    <CommandGroup>
                      {CLIENT_TYPES.map((option) => (
                        <CommandItem
                          key={option.value}
                          value={option.value}
                          onSelect={() => {
                            setClientType(
                              clientType.includes(option.value)
                                ? clientType.filter((v) => v !== option.value)
                                : [...clientType, option.value]
                            )
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              clientType.includes(option.value) ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {option.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>
              {t({ en: "Fee", ar: "الرسوم" }, lang)}
            </Label>
            <Input
              type="text"
              min="0"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              placeholder={t(
                { en: "e.g. 500 per session", ar: "مثال: 500" },
                lang
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>
              {t({ en: "Availability", ar: "أوقات التوفر" }, lang)}
            </Label>
            <Input
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              placeholder={t(
                { en: "e.g. Weekdays 9am-5pm", ar: "مثال: أيام الأسبوع 9ص-5م" },
                lang
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>
              {t({ en: "Message", ar: "رسالة" }, lang)}
            </Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t(
                {
                  en: "Tell us about your expertise and why you'd like to join...",
                  ar: "أخبرنا عن خبرتك ولماذا ترغب في الانضمام...",
                },
                lang
              )}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>
              {t({ en: "Profile Photo", ar: "الصورة الشخصية" }, lang)}
            </Label>
            <div className="border-2 border-dashed border-border rounded-lg p-4">
              <input
                ref={profilePhotoInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePhotoChange}
                className="hidden"
                id="profile-photo-upload"
              />
              <label
                htmlFor="profile-photo-upload"
                className="flex flex-col items-center justify-center cursor-pointer gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Paperclip className="h-5 w-5" />
                <span>
                  {t(
                    {
                      en: "Click to upload your profile photo",
                      ar: "انقر لرفع صورتك الشخصية",
                    },
                    lang
                  )}
                </span>
              </label>
            </div>

            {profilePhoto && (
              <div className="flex flex-wrap gap-2 mt-2">
                <div className="flex items-center gap-1.5 bg-muted rounded-full px-3 py-1 text-sm">
                  <Paperclip className="h-3 w-3" />
                  <span className="max-w-[150px] truncate">
                    {profilePhoto.name}
                  </span>
                  <button
                    type="button"
                    onClick={removeProfilePhoto}
                    className="hover:text-red-500 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label>
              {t({ en: "Upload CV", ar: "رفع السيرة الذاتية" }, lang)}
            </Label>
            <div className="border-2 border-dashed border-border rounded-lg p-4">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center cursor-pointer gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Paperclip className="h-5 w-5" />
                <span>
                  {t(
                    {
                      en: "Click to upload your CV",
                      ar: "انقر لرفع سيرتك الذاتية",
                    },
                    lang
                  )}
                </span>
              </label>
            </div>

            {files.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1.5 bg-muted rounded-full px-3 py-1 text-sm"
                  >
                    <Paperclip className="h-3 w-3" />
                    <span className="max-w-[150px] truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="hover:text-red-500 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>


          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                window.scrollTo({ top: 0 })
                setStep(1)
              }}
            >
              {t({ en: "Back", ar: "رجوع" }, lang)}
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting
                ? t({ en: "Submitting...", ar: "جارٍ الإرسال..." }, lang)
                : t({ en: "Submit Application", ar: "إرسال الطلب" }, lang)}
            </Button>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            {t(
              {
                en: "Your application will be reviewed by our team. You will receive an email once your account is approved.",
                ar: "سيتم مراجعة طلبك من قبل فريقنا. ستتلقى بريدًا إلكترونيًا بمجرد الموافقة على حسابك.",
              },
              lang
            )}
          </p>
            </>
          )}
        </CardContent>
      </Card>
    </form>
  )
}
