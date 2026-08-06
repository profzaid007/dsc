"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import { DateInput } from "@/components/ui/date-input"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar, Loader2 } from "lucide-react"
import {
  PortalServiceSelector,
  type PortalServiceValue,
} from "@/components/register/PortalServiceSelector"
import { getPortalById } from "@/lib/portals"
import { formatDate } from "@/lib/format-date"
import { t } from "@/lib/i18n"
import { useLang } from "@/lib/lang-context"
interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BookConsultDialog({ open, onOpenChange }: Props) {

  const [name, setName] = useState("")
  const [countryCode, setCountryCode] = useState("")
  const [contact, setContact] = useState("")
  const [email, setEmail] = useState("")
  const [description, setDescription] = useState("")
  const [consultationType, setConsultationType] = useState<"online" | "face-to-face" | "">("")
  const [preferredDate, setPreferredDate] = useState("")
  const [preferredTime, setPreferredTime] = useState("")
  const [portalService, setPortalService] = useState<PortalServiceValue>({
    categoryId: "",
    subCategoryId: "",
    customCategory: "",
    customSubCategory: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")

  const router = useRouter()
  const { lang } = useLang()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError("")


    try {
      const { categoryId, subCategoryId, customCategory, customSubCategory } = portalService

      const portal = getPortalById(categoryId)
      const service = portal?.services.find((s) => s.id === subCategoryId)

      const issueType = customCategory || portal?.title || ""
      const caseType = customSubCategory || service?.name.en || ""

      const html = [
        t({ en: "<h2>New Consultation Request</h2>", ar: "<h2>طلب استشارة جديد</h2>" }, lang),
        `<p><strong>${t({ en: "Name:", ar: "الاسم:" }, lang)}</strong> ${name}</p>`,
        `<p><strong>${t({ en: "Contact:", ar: "التواصل:" }, lang)}</strong> ${countryCode} ${contact}</p>`,
        `<p><strong>${t({ en: "Email:", ar: "البريد الإلكتروني:" }, lang)}</strong> ${email}</p>`,
        issueType ? `<p><strong>${t({ en: "Issue Type:", ar: "نوع المشكلة:" }, lang)}</strong> ${issueType}</p>` : "",
        caseType ? `<p><strong>${t({ en: "Case Type:", ar: "نوع الحالة:" }, lang)}</strong> ${caseType}</p>` : "",
        consultationType ? `<p><strong>${t({ en: "Consultation Type:", ar: "نوع الاستشارة:" }, lang)}</strong> ${consultationType === "online" ? t({ en: "Online", ar: "أونلاين" }, lang) : t({ en: "Face to Face", ar: "وجهاً لوجه" }, lang)}</p>` : "",
        preferredDate ? `<p><strong>${t({ en: "Preferred Date:", ar: "التاريخ المفضل:" }, lang)}</strong> ${formatDate(preferredDate)}</p>` : "",
        preferredTime ? `<p><strong>${t({ en: "Preferred Time:", ar: "الوقت المفضل:" }, lang)}</strong> ${preferredTime}</p>` : "",
        description ? `<p><strong>${t({ en: "Description:", ar: "الوصف:" }, lang)}</strong><br/>${description}</p>` : "",
      ].join("\n")

      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "admin@dsc.ac",
          to: email,
          cc: "consult@dsc.ac",
          subject: t({ en: `Consultation request from: ${name}`, ar: `طلب استشارة من: ${name}` }, lang),
          html,
        }),
      })

      const message_response = await fetch("/api/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${name}`,
          contact: `${countryCode} ${contact}`,
          email: `${email}`,
          issueType: `${issueType}`,
          caseType: `${caseType}`,
          consultationType: `${consultationType}`,
          preferredDate: `${formatDate(preferredDate)}`,
          preferredTime: `${preferredTime}`,
          description: `${description}`,
        }),
      })

      if (!response.ok || !message_response.ok) {
        const { error: errMsg } = await response.json()
        throw new Error(errMsg || t({ en: "Failed to send request", ar: "فشل إرسال الطلب" }, lang))
      }

      setDone(true)
      router.push("https://wa.me/message/XGN76UVRTVL7C1")

    } catch (err) {
      setError(err instanceof Error ? err.message : t({ en: "Something went wrong", ar: "حدث خطأ ما" }, lang))
    } finally {
      setSubmitting(false)
    }
  }

  function handleClose() {
    onOpenChange(false)
    // reset after dialog closes
    setTimeout(() => {
      setName("")
      setCountryCode("")
      setContact("")
      setEmail("")
      setDescription("")
      setConsultationType("")
      setPreferredDate("")
      setPreferredTime("")
      setPortalService({
        categoryId: "",
        subCategoryId: "",
        customCategory: "",
        customSubCategory: "",
      })
      setDone(false)
      setError("")
    }, 200)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto overscroll-contain sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {t({ en: "Book Consult", ar: "حجز استشارة" }, lang)}
          </DialogTitle>

          <DialogDescription>
            {t(
              { en: "Fill in your details and we'll get back to you.", ar: "املأ بياناتك وسنعاود التواصل معك." },
              lang
            )}
          </DialogDescription>

        </DialogHeader>
        {done ? (
          <div className="py-6 text-center text-sm text-green-600">
            {t(
              { en: "Your consultation request has been sent successfully! We'll contact you within 48 hours.", ar: "تم إرسال طلب الاستشارة بنجاح! سنتواصل معك خلال 48 ساعة." },
              lang
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">{t({ en: "Name", ar: "الاسم" }, lang)}</label>
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t({ en: "Your name", ar: "اسمك" }, lang)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t({ en: "Contact", ar: "التواصل" }, lang)}</label>
              <div className="flex gap-2">
                <Input
                  type="tel"
                  required
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  placeholder={t({ en: "Country code", ar: "رمز الدولة" }, lang)}
                  className="w-28"
                />
                <Input
                  type="tel"
                  required
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder={t({ en: "Phone number", ar: "رقم الهاتف" }, lang)}
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">{t({ en: "Email", ar: "البريد الإلكتروني" }, lang)}</label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
              />
            </div>

            <PortalServiceSelector
              value={portalService}
              onChange={setPortalService}
              required
            />

            <div className="space-y-3">
              <p className="text-sm font-medium">
                {t({ en: "Consultation Preferences", ar: "تفضيلات الاستشارة" }, lang)}
              </p>
              <div>
                <Label className="mb-1 block text-sm font-medium">
                  {t({ en: "Type", ar: "النوع" }, lang)}
                </Label>
                <Select
                  value={consultationType}
                  onValueChange={(v: "online" | "face-to-face") => setConsultationType(v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t({ en: "Select type", ar: "اختر النوع" }, lang)} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">{t({ en: "Online", ar: "أونلاين" }, lang)}</SelectItem>
                    <SelectItem value="face-to-face">{t({ en: "Face to Face", ar: "وجهاً لوجه" }, lang)}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1 block text-sm font-medium">
                  {t({ en: "Preferred Date", ar: "التاريخ المفضل" }, lang)}
                </Label>
                <DateInput
                  value={preferredDate}
                  onChange={setPreferredDate}
                  className="w-full"
                />
              </div>
              <div>
                <Label className="mb-1 block text-sm font-medium">
                  {t({ en: "Preferred Time", ar: "الوقت المفضل" }, lang)}
                </Label>
                <Input
                  type="time"
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                {t({ en: "Description", ar: "الوصف" }, lang)}
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t(
                  { en: "Briefly describe what you need help with", ar: "صف بإيجاز ما تحتاج مساعدة فيه" },
                  lang
                )}
                rows={4}
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t({ en: "Sending...", ar: "جارٍ الإرسال..." }, lang)}
                </>
              ) : (
                t({ en: "Submit", ar: "إرسال" }, lang)
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
