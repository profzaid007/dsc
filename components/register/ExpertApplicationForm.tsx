"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { t } from "@/lib/i18n"
import { useLang } from "@/lib/lang-context"
import pb from "@/lib/pb"
import { Paperclip, X } from "lucide-react"

export function ExpertApplicationForm() {
  const { lang } = useLang()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState("")
  const [contactNumber, setContactNumber] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [message, setMessage] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const passwordTooShort = password.length > 0 && password.length < 8
  const passwordsMismatch =
    passwordConfirm.length > 0 && password !== passwordConfirm

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
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
    if (!name || !contactNumber || !email || !password || !passwordConfirm) {
      setError(
        t(
          { en: "Please fill in all required fields", ar: "يرجى ملء جميع الحقول المطلوبة" },
          lang
        )
      )
      return false
    }
    if (password.length < 8) {
      setError(
        t(
          { en: "Password must be at least 8 characters", ar: "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل" },
          lang
        )
      )
      return false
    }
    if (password !== passwordConfirm) {
      setError(
        t({ en: "Passwords do not match", ar: "كلمتا المرور غير متطابقتين" }, lang)
      )
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validate()) return

    const totalSize = files.reduce((sum, f) => sum + f.size, 0)
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
      const html = [
        "<h2>New Expert Application</h2>",
        `<p><strong>Name:</strong> ${name}</p>`,
        `<p><strong>Contact Number:</strong> ${contactNumber}</p>`,
        `<p><strong>Email:</strong> ${email}</p>`,
        message ? `<p><strong>Message:</strong><br/>${message}</p>` : "",
        files.length ? `<p><strong>Attachments:</strong> ${files.map((f) => f.name).join(", ")}</p>` : "",
      ].join("\n")

      const formData = new FormData()
      formData.set("email", email.toLowerCase())
      formData.set("password", password)
      formData.set("passwordConfirm", passwordConfirm)
      formData.set("name", name)
      formData.set("role", "expert")
      formData.set("contact_number", contactNumber)
      formData.set("is_active", "false")
      formData.set("emailVisibility", "true")
      formData.set("message", message)
      files.forEach((file) => formData.append("attachments", file))

      await pb.collection("users").create(formData)

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
          to: email,
          cc: "admin@dsc.ac",
          subject: `Expert application from: ${name}`,
          html,
          attachments,
        }),
      })

      if (!response.ok) {
        router.push("/login?expert_pending=1&warn=1")
      } else {
        router.push("/login?expert_pending=1")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {t(
              { en: "Expert Application", ar: "طلب التقديم كخبير" },
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

          <div className="space-y-2">
            <Label>
              {t({ en: "Full Name", ar: "الاسم الكامل" }, lang)}
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t(
                { en: "e.g. Dr. Ahmed Al-Rashid", ar: "مثال: د. أحمد الراشد" },
                lang
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                {t({ en: "Contact Number", ar: "رقم التواصل" }, lang)}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                type="tel"
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                {t({ en: "Password", ar: "كلمة المرور" }, lang)}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              {passwordTooShort && (
                <p className="text-sm text-red-500">
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
              <Input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder={t(
                  { en: "Re-enter your password", ar: "أعد إدخال كلمة المرور" },
                  lang
                )}
              />
              {passwordsMismatch && (
                <p className="text-sm text-red-500">
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
              {t({ en: "Attachments", ar: "المرفقات" }, lang)}
            </Label>
            <div className="border-2 border-dashed border-border rounded-lg p-4">
              <input
                ref={fileInputRef}
                type="file"
                multiple
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
                      en: "Click to attach files or drag and drop",
                      ar: "انقر لإرفاق ملفات أو اسحب وأفلت",
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

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting
              ? t({ en: "Submitting...", ar: "جارٍ الإرسال..." }, lang)
              : t({ en: "Submit Application", ar: "إرسال الطلب" }, lang)}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            {t(
              {
                en: "Your application will be reviewed by our team. You will receive an email once your account is approved.",
                ar: "سيتم مراجعة طلبك من قبل فريقنا. ستتلقى بريدًا إلكترونيًا بمجرد الموافقة على حسابك.",
              },
              lang
            )}
          </p>
        </CardContent>
      </Card>
    </form>
  )
}
