"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"
import { useLang } from "@/lib/lang-context"

interface RegistrationFormProps {
  onSubmit: (data: {
    userName: string
    email: string
    phone?: string
  }) => Promise<void>
  isSubmitting?: boolean
  isFull?: boolean
  isAlreadyRegistered?: boolean
  title?: string
}

export function RegistrationForm({
  onSubmit,
  isSubmitting = false,
  isFull = false,
  isAlreadyRegistered = false,
  title,
}: RegistrationFormProps) {
  const { lang } = useLang()
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    phone: "",
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
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
                ? "أنت مسجل بالفعل في هذا البرنامج التدريبي."
                : "You are already registered for this training program."}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (isFull) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {lang === "ar"
                ? "عذراً، هذا البرنامج التدريبي ممتلئ."
                : "Sorry, this training program is full."}
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
          {title ||
            (lang === "ar"
              ? "التسجيل في البرنامج التدريبي"
              : "Register for Training Program")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
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
