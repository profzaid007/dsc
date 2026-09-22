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
import { DateInput } from "@/components/ui/date-input"
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

const GENDERS = [
  { label: { en: "Male", ar: "ذكر" }, value: "male" },
  { label: { en: "Female", ar: "نث" }, value: "female" },
  { label: { en: "Other", ar: "آخر" }, value: "other" },
]

export function IndividualRegistrationForm({
  onSuccess,
}: {
  onSuccess?: () => void
} = {}) {
  const { lang } = useLang()
  const router = useRouter()

  const [name, setName] = useState("")
  const [countryCode, setCountryCode] = useState("")
  const [contactNumber, setContactNumber] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Extra fields
  const [gender, setGender] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [residence, setResidence] = useState("")
  const [emContactName, setEmContactName] = useState("")
  const [emContactNumber, setEmContactNumber] = useState("")
  const [notes, setNotes] = useState("")

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
    if (!gender) errs.gender = required

    setFieldErrors(errs)
    if (Object.keys(errs).length > 0) {
      setError("")
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
      const cleanEmail = normalizeEmail(email)

      const user = await pb.collection("users").create({
        email: cleanEmail,
        password,
        passwordConfirm: password,
        name: cleanName,
        contact_number: `${countryCode} ${contactNumber.trim()}`.trim(),
        role: "individual",
        emailVisibility: true,
        is_active: true,
      })

      await pb.collection("individual_profiles").create({
        user: user.id,
        gender: gender,
        date_of_birth: dateOfBirth,
        country_of_residence: residence,
        emergency_contact_name: emContactName.trim(),
        emergency_contact_phone: emContactNumber.trim(),
        notes: notes.trim(),
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
        router.push(getDashboardPath("individual"))
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
            {t({ en: "Individual Registration", ar: "تسجيل فردي" }, lang)}
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
                  { en: "e.g. Ahmed Hassan", ar: "مثال: أحمد حسن" },
                  lang
                )}
              />
              {fieldErrorNode("name")}
            </div>

            <div className="space-y-2">
              <Label>
                {t({ en: "Mobile Number", ar: "رقم الجوال" }, lang)}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <div className="flex gap-2">
                <Select value={countryCode} onValueChange={setCountryCode}>
                  <SelectTrigger className="w-30">
                    <SelectValue placeholder="e.g. +966" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="max-h-60! max-w-40">
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
            <div className="space-y-2">
              <Label>
                {t(
                  { en: "Gender", ar: "جنس" },
                  lang
                )}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger className="w-75">
                  <SelectValue placeholder={t({en: "e.g. Male", ar: "على سبيل المثا"}, lang)} />
                </SelectTrigger>
                <SelectContent position="popper" className="max-h-60!">
                  {GENDERS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {t(c.label, lang)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrorNode("gender")}
            </div>

            <div className="space-y-2">
              <Label>
                {t({ en: "Date of Birth", ar: "تاريخ الميلاد" }, lang)}
              </Label>
              <DateInput
                value={dateOfBirth}
                onChange={setDateOfBirth}
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                {t({ en: "Emergency Contact Name", ar: "اسم جهة الاتصال في الطوارئ" }, lang)}
              </Label>
              <Input
                value={emContactName}
                onChange={(e) => setEmContactName(e.target.value)}
                autoComplete="off"
                placeholder={t(
                  { en: "e.g. Fatima Al-Hassan", ar: "مثال: فاطمة الحسن" },
                  lang
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>
                {t({ en: "Emergency Contact Number", ar: "رقم جهة الاتصال في الطوارئ" }, lang)}
              </Label>
              <Input
                value={emContactNumber}
                onChange={(e) => setEmContactNumber(e.target.value)}
                autoComplete="off"
                inputMode="tel"
                placeholder={t(
                  { en: "e.g. 55 000 0000", ar: "مثال: 55 000 0000" },
                  lang
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              {t({ en: "Notes", ar: "ملاحظات" }, lang)}
            </Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t(
                {
                  en: "Add any additional notes...",
                  ar: "أضف أي ملاحظات إضافية...",
                },
                lang
              )}
              rows={3}
            />
          </div>

          <Button type="submit" className="mt-10 p-4 w-full" disabled={isSubmitting}>
            {isSubmitting
              ? t({ en: "Registering...", ar: "جارٍ التسجيل..." }, lang)
              : t({ en: "Register", ar: "تسجيل" }, lang)}
          </Button>
        </CardContent>
      </Card>
    </form>
  )
}
