"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { EmailInput } from "@/components/ui/email-input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle } from "lucide-react"
import { useLang } from "@/lib/lang-context"
import { t } from "@/lib/i18n"
import {
  EMAIL_INVALID_MESSAGE,
  isValidEmail,
  normalizeEmail,
} from "@/lib/validators"

interface RegistrationFormProps {
  onSubmit: (data: {
    userName: string
    email: string
    phone?: string
  }) => Promise<void>
  isSubmitting?: boolean
  isAlreadyRegistered?: boolean
}

export function RegistrationForm({
  onSubmit,
  isSubmitting = false,
  isAlreadyRegistered = false,
}: RegistrationFormProps) {
  const { lang } = useLang()
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    phone: "",
  })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!isValidEmail(formData.email)) {
      setError(t(EMAIL_INVALID_MESSAGE, lang))
      return
    }
    await onSubmit({
      ...formData,
      userName: formData.userName.trim(),
      email: normalizeEmail(formData.email),
      phone: formData.phone?.trim(),
    })
    setSubmitted(true)
  }

  if (isAlreadyRegistered) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              {lang === "ar"
                ? "أنت مسجل بالفعل في هذه المحاضرة."
                : "You are already registered for this lecture."}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (submitted) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              {lang === "ar"
                ? "تم التسجيل بنجاح! سيتم إرسال تأكيد إلى بريدك الإلكتروني."
                : "Registration successful! A confirmation will be sent to your email."}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {lang === "ar" ? "تسجيل في المحاضرة" : "Register for Lecture"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="space-y-2">
            <Label htmlFor="userName">
              {lang === "ar" ? "الاسم الكامل *" : "Full Name *"}
            </Label>
            <Input
              id="userName"
              value={formData.userName}
              onChange={(e) =>
                setFormData({ ...formData, userName: e.target.value })
              }
              autoComplete="name"
              placeholder={
                lang === "ar" ? "أدخل اسمك الكامل" : "Enter your full name"
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              {lang === "ar" ? "البريد الإلكتروني *" : "Email *"}
            </Label>
            <EmailInput
              id="email"
              value={formData.email}
              onChange={(value) => setFormData({ ...formData, email: value })}
              placeholder={
                lang === "ar"
                  ? "أدخل بريدك الإلكتروني"
                  : "Enter your email"
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              {lang === "ar" ? "رقم الهاتف" : "Phone Number"}
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              autoComplete="tel"
              inputMode="tel"
              placeholder={
                lang === "ar"
                  ? "أدخل رقم هاتفك"
                  : "Enter your phone number"
              }
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting
              ? lang === "ar"
                ? "جاري التسجيل..."
                : "Registering..."
              : lang === "ar"
                ? "تأكيد التسجيل"
                : "Confirm Registration"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
