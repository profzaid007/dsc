"use client"

import { useState } from "react"
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
import { t } from "@/lib/i18n"
import { useLang } from "@/lib/lang-context"
import { COUNTRY_CODES } from "@/lib/country-codes"
import {
  PortalServiceSelector,
  type PortalServiceValue,
} from "./PortalServiceSelector"
import pb, {
  authWithPassword,
  getErrorMessage,
  getFieldErrors,
} from "@/lib/pb"
import { getDashboardPath } from "@/lib/dashboard-routes"
import {
  EMAIL_INVALID_MESSAGE,
  isValidEmail,
  normalizeEmail,
} from "@/lib/validators"
import { toast } from "sonner"

const OTHER_VALUE = "other"

const ORGANIZATION_TYPES = [
  { label: { en: "School", ar: "مدرسة" }, value: "school" },
  { label: { en: "NGO", ar: "منظمة غير ربحية" }, value: "ngo" },
  { label: { en: "Corporate", ar: "شركة" }, value: "corporate" },
  { label: { en: "Government", ar: "جهة حكومية" }, value: "government" },
  { label: { en: "Clinic", ar: "عيادة" }, value: "clinic" },
  { label: { en: "Hospital", ar: "مستشفى" }, value: "hospital" },
  { label: { en: "Other", ar: "أخرى" }, value: "other" },
]

export function OrganizationRegistrationForm({
  onSuccess,
}: {
  onSuccess?: () => void
} = {}) {
  const { lang } = useLang()
  const router = useRouter()

  const [name, setName] = useState("")
  const [organizationName, setOrganizationName] = useState("")
  const [representativeName, setRepresentativeName] = useState("")
  const [countryCode, setCountryCode] = useState("")
  const [contactNumber, setContactNumber] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [portalService, setPortalService] = useState<PortalServiceValue>({
    categoryId: "",
    subCategoryId: "",
    customCategory: "",
    customSubCategory: "",
  })
  const [notes, setNotes] = useState("")
  const [organizationType, setOrganizationType] = useState("")
  const [country, setCountry] = useState("")
  const [city, setCity] = useState("")
  const [website, setWebsite] = useState("")
  const [representativeNumber, setRepresentativeNumber] = useState("")
  const [representativeTitle, setRepresentativeTitle] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const passwordTooShort = password.length > 0 && password.length < 8
  const passwordsMismatch =
    confirmPassword.length > 0 && password !== confirmPassword

  const fieldErrorNode = (...keys: string[]) => {
    const msg = keys.map((k) => fieldErrors[k]).find(Boolean)
    return msg ? <p className="text-xs text-red-500">{msg}</p> : null
  }

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    const required = t(
      { en: "This field is required.", ar: "هذا الحقل مطلوب." },
      lang
    )

    if (!name.trim()) errs.name = required
    if (!organizationName.trim()) errs.organizationName = required
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
    if (!confirmPassword) errs.confirmPassword = required
    else if (password !== confirmPassword)
      errs.confirmPassword = t(
        { en: "Passwords do not match", ar: "كلمات المرور غير متطابقة" },
        lang
      )

    setFieldErrors(errs)
    if (Object.keys(errs).length > 0) {
      setError("")
      return false
    }

    if (!portalService.categoryId || !portalService.subCategoryId.trim()) {
      setError(
        t(
          {
            en: "Please select a service and issue type",
            ar: "يرجى اختيار نوع الخدمة ونوع المشكلة",
          },
          lang
        )
      )
      return false
    }
    if (
      portalService.categoryId === OTHER_VALUE &&
      !portalService.customCategory.trim()
    ) {
      setError(
        t(
          {
            en: "Please enter a custom service name",
            ar: "يرجى إدخال اسم خدمة مخصصة",
          },
          lang
        )
      )
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setFieldErrors({})

    if (!validate()) return

    setIsSubmitting(true)

    try {
      const cleanName = name.trim()
      const cleanOrganizationName = organizationName.trim()
      const cleanEmail = normalizeEmail(email)

      const user = await pb.collection("users").create({
        email: cleanEmail,
        password,
        passwordConfirm: password,
        name: cleanName,
        contact_number: `${countryCode} ${contactNumber.trim()}`.trim(),
        role: "organization",
        is_active: true,
        emailVisibility: true,
      })

      await pb.collection("organization_profiles").create({
        user: user.id,
        organization_name: cleanOrganizationName,
        organization_type: organizationType,
        country: country,
        city: city.trim(),
        website: website.trim(),
        responsible_person_name: representativeName.trim(),
        responsible_person_title: representativeTitle.trim(),
        responsible_person_phone: representativeNumber.trim(),
        notes: notes.trim(),
      })

      await pb.collection("cases").create({
        user: user.id,
        name: cleanOrganizationName,
        portal_type: portalService.categoryId,
        service_type: portalService.subCategoryId.trim(),
        notes: notes.trim(),
        status: "pending",
        user_details: {
          name: user.name,
          email: user.email,
          contact: user.contact_number,
        },
        case_details: {
          custom_category:
            portalService.categoryId === OTHER_VALUE
              ? portalService.customCategory.trim()
              : undefined,
          custom_sub_category: portalService.subCategoryId.trim() || undefined,
        },
      })

      toast.success(
        t(
          { en: "Account created successfully.", ar: "تم إنشاء الحساب بنجاح." },
          lang
        )
      )

      if (onSuccess) {
        onSuccess()
      } else {
        await authWithPassword(cleanEmail, password)
        router.push(getDashboardPath("organization"))
      }
    } catch (err) {
      const fieldErrs = getFieldErrors(err, lang)
      if (Object.keys(fieldErrs).length > 0) {
        setFieldErrors(fieldErrs)
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
            {t({ en: "Organization Registration", ar: "تسجيل مؤسسة" }, lang)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                {t({ en: "Name", ar: "الاسم" }, lang)}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                aria-invalid={fieldErrors.name ? true : undefined}
                placeholder={t(
                  { en: "e.g. Mohammed Al-Rashid", ar: "مثال: محمد الراشد" },
                  lang
                )}
              />
              {fieldErrorNode("name")}
            </div>

            <div className="space-y-2">
              <Label>
                {t({ en: "Organization Name", ar: "اسم المؤسسة" }, lang)}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                autoComplete="organization"
                aria-invalid={
                  fieldErrors.organizationName || fieldErrors.organization_name
                    ? true
                    : undefined
                }
                placeholder={t(
                  { en: "e.g. ABC Company", ar: "مثال: شركة أبجد" },
                  lang
                )}
              />
              {fieldErrorNode("organizationName", "organization_name")}
            </div>

            <div className="space-y-2">
              <Label>
                {t({ en: "Mobile Number", ar: "رقم الجوال" }, lang)}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <div className="flex gap-2">
                <Select value={countryCode} onValueChange={setCountryCode}>
                  <SelectTrigger className="w-28">
                    <SelectValue placeholder="+966" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="max-h-60! max-w-30!">
                    {COUNTRY_CODES.map((c) => (
                      <SelectItem key={c.value} value={c.dialCode}>
                        {t(c.label, lang)} ({c.dialCode})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
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

            <div className="space-y-2">
              <Label>
                {t({ en: "Password", ar: "كلمة المرور" }, lang)}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={fieldErrors.password ? true : undefined}
                placeholder="••••••••"
              />
              {fieldErrorNode("password")}
              {!fieldErrors.password && passwordTooShort && (
                <p className="text-xs text-red-500">
                  {t(
                    {
                      en: "Password must be at least 8 characters.",
                      ar: "يجب أن تكون كلمة المرور 8 أحرف على الأقل.",
                    },
                    lang
                  )}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>
                {t(
                  { en: "Confirm Password", ar: "تأكيد كلمة المرور" },
                  lang
                )}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <PasswordInput
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                aria-invalid={fieldErrors.confirmPassword || fieldErrors.passwordConfirm ? true : undefined}
                placeholder="••••••••"
              />
              {fieldErrorNode("confirmPassword", "passwordConfirm")}
              {!fieldErrors.confirmPassword && !fieldErrors.passwordConfirm && passwordsMismatch && (
                <p className="text-xs text-red-500">
                  {t(
                    {
                      en: "Passwords do not match",
                      ar: "كلمات المرور غير متطابقة",
                    },
                    lang
                  )}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                {t({ en: "Organization Type", ar: "نوع المؤسسة" }, lang)}
              </Label>
              <Select value={organizationType} onValueChange={setOrganizationType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t({ en: "Select type...", ar: "اختر النوع..." }, lang)} />
                </SelectTrigger>
                <SelectContent position="popper">
                  {ORGANIZATION_TYPES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {t(c.label, lang)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                {t({ en: "Country", ar: "الدولة" }, lang)}
              </Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t({ en: "Select country...", ar: "اختر الدولة..." }, lang)} />
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

            <div className="space-y-2">
              <Label>
                {t({ en: "Website", ar: "الموقع الإلكتروني" }, lang)}
              </Label>
              <Input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://example.com"
              />
            </div>

            <div className="space-y-2">
              <Label>
                {t({ en: "Representative Name", ar: "اسم الممثل" }, lang)}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                value={representativeName}
                onChange={(e) => setRepresentativeName(e.target.value)}
                placeholder={t(
                  { en: "e.g. Mohammed Al-Rashid", ar: "مثال: محمد الراشد" },
                  lang
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>
                {t({ en: "Representative Number", ar: "رقم الممثل" }, lang)}
              </Label>
              <Input
                value={representativeNumber}
                onChange={(e) => setRepresentativeNumber(e.target.value)}
                placeholder={t(
                  { en: "e.g. 55 000 0000", ar: "مثال: 55 000 0000" },
                  lang
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>
                {t({ en: "Representative Title", ar: "المسمى الوظيفي للممثل" }, lang)}
              </Label>
              <Input
                value={representativeTitle}
                onChange={(e) => setRepresentativeTitle(e.target.value)}
                placeholder={t(
                  { en: "e.g. HR Manager", ar: "مثال: مدير الموارد البشرية" },
                  lang
                )}
              />
            </div>
          </div>

          <PortalServiceSelector
            value={portalService}
            onChange={setPortalService}
            required
          />

          <div className="space-y-2">
            <Label>
              {t({ en: "Notes", ar: "ملاحظات" }, lang)}
            </Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t(
                {
                  en: "Add any additional notes about this case...",
                  ar: "أضف أي ملاحظات إضافية حول هذه الحالة...",
                },
                lang
              )}
              rows={3}
            />
          </div>

          <Button type="submit" className="p-4 w-full" disabled={isSubmitting}>
            {isSubmitting
              ? t({ en: "Registering...", ar: "جارٍ التسجيل..." }, lang)
              : t({ en: "Register", ar: "تسجيل" }, lang)}
          </Button>
        </CardContent>
      </Card>
    </form>
  )
}
