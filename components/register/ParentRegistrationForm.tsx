"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { t } from "@/lib/i18n"
import { useLang } from "@/lib/lang-context"
import { ChildFormBlock, type ChildFormData } from "./ChildFormBlock"
import { Plus } from "lucide-react"

function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

export function ParentRegistrationForm() {
  const { lang } = useLang()
  const router = useRouter()

  const [name, setName] = useState("")
  const [contactNumber, setContactNumber] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [children, setChildren] = useState<ChildFormData[]>([
    {
      id: generateId(),
      name: "",
      date_of_birth: "",
      gender: "",
      grade: "",
      caseTypeId: "",
      caseTypeKey: "",
      formData: {},
    },
  ])

  const addChild = () => {
    setChildren((prev) => [
      ...prev,
      {
        id: generateId(),
        name: "",
        date_of_birth: "",
        gender: "",
        grade: "",
        caseTypeId: "",
        caseTypeKey: "",
        formData: {},
      },
    ])
  }

  const removeChild = (id: string) => {
    setChildren((prev) => prev.filter((c) => c.id !== id))
  }

  const updateChild = (id: string, data: ChildFormData) => {
    setChildren((prev) => prev.map((c) => (c.id === id ? data : c)))
  }

  const validate = (): boolean => {
    if (!name || !contactNumber || !email || !password) {
      setError(t({ en: "Please fill in all required fields", ar: "يرجى ملء جميع الحقول المطلوبة" }, lang))
      return false
    }
    if (password !== confirmPassword) {
      setError(t({ en: "Passwords do not match", ar: "كلمات المرور غير متطابقة" }, lang))
      return false
    }
    for (const child of children) {
      if (!child.name || !child.date_of_birth || !child.gender || !child.caseTypeId) {
        setError(
          t(
            { en: "Please fill in all child information", ar: "يرجى ملء جميع معلومات الطفل" },
            lang
          )
        )
        return false
      }
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validate()) return

    setIsSubmitting(true)

    // TODO: Wire up PocketBase registration
    console.log("Parent Registration Data:", {
      name,
      contactNumber,
      email,
      password,
      children,
    })

    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsSubmitting(false)
    router.push("/login")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

            <div className="space-y-2 md:col-span-2">
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
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          {t({ en: "Children Information", ar: "معلومات الأطفال" }, lang)}
        </h3>
        {children.map((child, index) => (
          <ChildFormBlock
            key={child.id}
            index={index}
            data={child}
            onChange={(data) => updateChild(child.id, data)}
            onRemove={() => removeChild(child.id)}
            canRemove={children.length > 1}
          />
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addChild}
          className="w-full gap-2"
        >
          <Plus className="h-4 w-4" />
          {t({ en: "Add Another Child", ar: "إضافة طفل آخر" }, lang)}
        </Button>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting
          ? t({ en: "Registering...", ar: "جارٍ التسجيل..." }, lang)
          : t({ en: "Register", ar: "تسجيل" }, lang)}
      </Button>
    </form>
  )
}
