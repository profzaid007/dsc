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
import { Paperclip, X } from "lucide-react"

export function ExpertApplicationForm() {
  const { lang } = useLang()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState("")
  const [contactNumber, setContactNumber] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const validate = (): boolean => {
    if (!name || !contactNumber || !email) {
      setError(
        t(
          { en: "Please fill in all required fields", ar: "يرجى ملء جميع الحقول المطلوبة" },
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

    // TODO: Wire up PocketBase submission
    console.log("Expert Application Data:", {
      name,
      contactNumber,
      email,
      message,
      files: files.map((f) => f.name),
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
        </CardContent>
      </Card>
    </form>
  )
}
