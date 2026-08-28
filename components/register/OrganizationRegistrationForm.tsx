"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
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
import pb, { authWithPassword, handlePocketBaseError } from "@/lib/pb"

const OTHER_VALUE = "other"

export function OrganizationRegistrationForm() {
  const { lang } = useLang()
  const router = useRouter()

  const [organizationName, setOrganizationName] = useState("")
  const [name, setName] = useState("")
  const [countryCode, setCountryCode] = useState(COUNTRY_CODES[0].dialCode)
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const validate = (): boolean => {
    if (!organizationName || !name || !contactNumber || !email || !password) {
      setError(
        t(
          {
            en: "Please fill in all required fields",
            ar: "يرجى ملء جميع الحقول المطلوبة",
          },
          lang
        )
      )
      return false
    }
    if (password !== confirmPassword) {
      setError(
        t(
          { en: "Passwords do not match", ar: "كلمات المرور غير متطابقة" },
          lang
        )
      )
      return false
    }
    if (!portalService.categoryId || !portalService.subCategoryId) {
      setError(
        t(
          {
            en: "Please select a portal and service",
            ar: "يرجى اختيار البوابة والخدمة",
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
            en: "Please enter a custom portal name",
            ar: "يرجى إدخال اسم بوابة مخصصة",
          },
          lang
        )
      )
      return false
    }
    if (
      portalService.subCategoryId === OTHER_VALUE &&
      !portalService.customSubCategory.trim()
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

    if (!validate()) return

    setIsSubmitting(true)

    try {
      const user = await pb.collection("users").create({
        email: email.toLowerCase(),
        password,
        passwordConfirm: password,
        name,
        contact_number: `${countryCode} ${contactNumber}`,
        organization_name: organizationName,
        role: "organization",
        is_active:true,
        emailVisibility: true,
      })

      await pb.collection("cases").create({
        user: user.id,
        name: organizationName,
        category: portalService.categoryId,
        sub_category: portalService.subCategoryId,
        notes,
        case_details: {
          custom_category:
            portalService.categoryId === OTHER_VALUE
              ? portalService.customCategory
              : undefined,
          custom_sub_category:
            portalService.subCategoryId === OTHER_VALUE
              ? portalService.customSubCategory
              : undefined,
        },
      })

      await authWithPassword(email.toLowerCase(), password)
      router.push("/dashboard")
    } catch (err) {
      setError(handlePocketBaseError(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
                {t({ en: "Organization Name", ar: "اسم المؤسسة" }, lang)}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder={t(
                  { en: "e.g. ABC Company", ar: "مثال: شركة أبجد" },
                  lang
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>
                {t({ en: "Representative Name", ar: "اسم الممثل" }, lang)}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t(
                  { en: "e.g. Mohammed Al-Rashid", ar: "مثال: محمد الراشد" },
                  lang
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>
                {t({ en: "Mobile Number", ar: "رقم الجوال" }, lang)}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <div className="flex gap-2">
                <Select value={countryCode} onValueChange={setCountryCode}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
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
                  placeholder={t(
                    { en: "e.g. 50 000 0000", ar: "مثال: 50 000 0000" },
                    lang
                  )}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>
                {t({ en: "Email", ar: "البريد الإلكتروني" }, lang)}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label>
                {t({ en: "Password", ar: "كلمة المرور" }, lang)}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-2">
              <Label>
                {t(
                  { en: "Confirm Password", ar: "تأكيد كلمة المرور" },
                  lang
                )}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
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

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting
              ? t({ en: "Registering...", ar: "جارٍ التسجيل..." }, lang)
              : t({ en: "Register", ar: "تسجيل" }, lang)}
          </Button>
        </CardContent>
      </Card>
    </form>
  )
}
