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
import { ChildFormBlock, type ChildFormData } from "./ChildFormBlock"
import { Plus } from "lucide-react"
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

function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

function makeEmptyChild(): ChildFormData {
  return {
    id: generateId(),
    name: "",
    date_of_birth: "",
    gender: "",
    grade: "",
    relationship: "",
    portalService: {
      categoryId: "",
      subCategoryId: "",
      customCategory: "",
      customSubCategory: "",
    },
    notes: "",
  }
}

function hasChildData(child: ChildFormData): boolean {
  return Boolean(
    child.name ||
      child.date_of_birth ||
      child.gender ||
      child.grade ||
      child.relationship ||
      child.portalService.categoryId ||
      child.portalService.subCategoryId ||
      child.portalService.customCategory ||
      child.portalService.customSubCategory ||
      child.notes
  )
}

export function ParentRegistrationForm({
  onSuccess,
  hideChildren = false,
}: {
  onSuccess?: () => void
  hideChildren?: boolean
} = {}) {
  const { lang } = useLang()
  const router = useRouter()

  const [name, setName] = useState("")
  const [countryCode, setCountryCode] = useState("")
  const [contactNumber, setContactNumber] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [residence, setResidence] = useState("")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const [children, setChildren] = useState<ChildFormData[]>([makeEmptyChild()])

  const addChild = () => {
    setChildren((prev) => [...prev, makeEmptyChild()])
  }

  const removeChild = (id: string) => {
    setChildren((prev) => prev.filter((c) => c.id !== id))
  }

  const updateChild = (id: string, data: ChildFormData) => {
    setChildren((prev) => prev.map((c) => (c.id === id ? data : c)))
  }

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

    setFieldErrors(errs)
    if (Object.keys(errs).length > 0) {
      setError("")
      return false
    }

    for (const [index, child] of children.entries()) {
      if (!hasChildData(child)) continue
      const childLabel = t(
        { en: `Child ${index + 1}`, ar: `الطفل ${index + 1}` },
        lang
      )
      if (
        !child.name ||
        !child.date_of_birth ||
        !child.gender ||
        !child.relationship
      ) {
        setError(
          `${childLabel}: ${t(
            {
              en: "please fill in all required child information including relationship",
              ar: "يرجى ملء جميع معلومات الطفل المطلوبة بما في ذلك صلة القرابة",
            },
            lang
          )}`
        )
        return false
      }
      if (!child.portalService.categoryId || !child.portalService.subCategoryId) {
        setError(
          `${childLabel}: ${t(
            {
              en: "please select a service and issue type",
              ar: "يرجى اختيار نوع الخدمة ونوع المشكلة",
            },
            lang
          )}`
        )
        return false
      }
      if (
        child.portalService.categoryId === OTHER_VALUE &&
        !child.portalService.customCategory.trim()
      ) {
        setError(
          `${childLabel}: ${t(
            {
              en: "please enter a custom service name",
              ar: "يرجى إدخال اسم خدمة مخصصة",
            },
            lang
          )}`
        )
        return false
      }
      if (
        child.portalService.subCategoryId === OTHER_VALUE &&
        !child.portalService.customSubCategory.trim()
      ) {
        setError(
          `${childLabel}: ${t(
            {
              en: "please enter a custom issue type name",
              ar: "يرجى إدخال اسم نوع مشكلة مخصص",
            },
            lang
          )}`
        )
        return false
      }
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
        role: "parent",
        is_active: true,
        emailVisibility: true,
      })

      await pb.collection("parent_profiles").create({
        user: user.id,
        country_of_residence: residence,
        notes: notes.trim(),
      })

      for (const child of children) {
        if (!hasChildData(child)) continue
        await pb.collection("cases").create({
          user: user.id,
          name: child.name.trim(),
          date_of_birth: child.date_of_birth,
          gender: child.gender,
          grade: child.grade,
          relationship: child.relationship.trim(),
          portal_type: child.portalService.categoryId,
          service_type: child.portalService.subCategoryId === OTHER_VALUE
            ? child.portalService.customSubCategory.trim()
            : child.portalService.subCategoryId,
          notes: child.notes.trim(),
          status: "pending",
          user_details: {
            name: user.name,
            email: user.email,
            contact: user.contact_number,
          },
          case_details: {
            custom_category:
              child.portalService.categoryId === OTHER_VALUE
                ? child.portalService.customCategory.trim()
                : undefined,
            custom_sub_category:
              child.portalService.subCategoryId === OTHER_VALUE
                ? child.portalService.customSubCategory.trim()
                : undefined,
          },
        })
      }

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
        router.push(getDashboardPath("parent"))
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
            {t({ en: "Parent Information", ar: "معلومات ولي الأمر" }, lang)}
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
                {t({ en: "Mobile Number", ar: "رقم الجوال" }, lang)}
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

            <div className="space-y-2 md:col-span-2">
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
        </CardContent>
      </Card>

      {!hideChildren && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">
              {t({ en: "Children Information", ar: "معلومات الأطفال" }, lang)}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t(
                {
                  en: "Optional. You can add your children now or later from your dashboard.",
                  ar: "اختياري. يمكنك إضافة أطفالك الآن أو لاحقًا من لوحة التحكم.",
                },
                lang
              )}
            </p>
          </div>
          {children.map((child, index) => (
            <ChildFormBlock
              key={child.id}
              index={index}
              data={child}
              onChange={(data) => updateChild(child.id, data)}
              onRemove={() => removeChild(child.id)}
              canRemove
            />
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addChild}
            className="w-full gap-2"
          >
            <Plus className="h-4 w-4 p-4" />
            {t({ en: "Add Another Child", ar: "إضافة طفل آخر" }, lang)}
          </Button>
        </div>
      )}

      <Button type="submit" className="p-4 w-full" disabled={isSubmitting}>
        {isSubmitting
          ? t({ en: "Registering...", ar: "جارٍ التسجيل..." }, lang)
          : t({ en: "Register", ar: "تسجيل" }, lang)}
      </Button>
    </form>
  )
}
