"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { t } from "@/lib/i18n"
import { useLang } from "@/lib/lang-context"
import { CaseTypeSelector } from "./CaseTypeSelector"
import { DynamicCaseForm } from "./DynamicCaseForm"

export function OrganizationRegistrationForm() {
  const { lang } = useLang()
  const router = useRouter()

  const [organizationName, setOrganizationName] = useState("")
  const [name, setName] = useState("")
  const [contactNumber, setContactNumber] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [caseTypeId, setCaseTypeId] = useState("")
  const [caseTypeKey, setCaseTypeKey] = useState("")
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const validate = (): boolean => {
    if (!organizationName || !name || !contactNumber || !email || !password || !caseTypeId) {
      setError(
        t(
          { en: "Please fill in all required fields", ar: "يرجى ملء جميع الحقول المطلوبة" },
          lang
        )
      )
      return false
    }
    if (password !== confirmPassword) {
      setError(t({ en: "Passwords do not match", ar: "كلمات المرور غير متطابقة" }, lang))
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validate()) return

    setIsSubmitting(true)

    // TODO: Wire up PocketBase registration + case creation
    console.log("Organization Registration Data:", {
      organizationName,
      name,
      contactNumber,
      email,
      password,
      caseTypeId,
      caseTypeKey,
      formData,
    })

    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsSubmitting(false)
    router.push("/login")
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
              <Input
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder={t(
                  { en: "e.g. +966 50 000 0000", ar: "مثال: 966+ 50 000 0000" },
                  lang
                )}
              />
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
                {t({ en: "Confirm Password", ar: "تأكيد كلمة المرور" }, lang)}
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

          <CaseTypeSelector
            value={caseTypeId}
            onChange={(id, key) => {
              setCaseTypeId(id)
              setCaseTypeKey(key)
              setFormData({})
            }}
            required
          />

          {caseTypeKey && (
            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-3">
                {t({ en: "Case Details", ar: "تفاصيل الحالة" }, lang)}
              </p>
              <DynamicCaseForm
                caseTypeKey={caseTypeKey}
                values={formData}
                onChange={(fieldId, value) => {
                  setFormData((prev) => ({ ...prev, [fieldId]: value }))
                }}
              />
            </div>
          )}

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
