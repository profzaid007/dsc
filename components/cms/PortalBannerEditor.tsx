"use client"

import { useState } from "react"
import pb, { getErrorMessage } from "@/lib/pb"
import { useLang } from "@/lib/lang-context"
import type { Portal } from "@/lib/portals"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

export function PortalBannerEditor({
  portal,
  onSaved,
}: {
  portal: Portal
  onSaved: () => Promise<void>
}) {
  const { lang } = useLang()
  const ar = lang === "ar"
  const [heading, setHeading] = useState({ ...portal.heroTitle })
  const [description, setDescription] = useState({ ...portal.heroText })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [saved, setSaved] = useState(false)
  const dirty =
    heading.en !== portal.heroTitle.en ||
    heading.ar !== portal.heroTitle.ar ||
    description.en !== portal.heroText.en ||
    description.ar !== portal.heroText.ar
  async function save(event: React.FormEvent) {
    event.preventDefault()
    if (!portal.recordId || saving) return
    setError("")
    setSaved(false)
    if (
      ![heading.en, heading.ar, description.en, description.ar].every((value) =>
        value.trim()
      )
    ) {
      setError(
        ar
          ? "أدخل عنوان البانر ووصفه باللغتين."
          : "Enter the banner heading and description in both languages."
      )
      return
    }
    setSaving(true)
    try {
      const record = await pb.collection("portals").getOne(portal.recordId)
      await pb
        .collection("portals")
        .update(portal.recordId, {
          config: {
            ...(record.config || {}),
            heroTitle: { en: heading.en.trim(), ar: heading.ar.trim() },
            heroText: { en: description.en.trim(), ar: description.ar.trim() },
          },
        })
      setHeading({ en: heading.en.trim(), ar: heading.ar.trim() })
      setDescription({ en: description.en.trim(), ar: description.ar.trim() })
      await onSaved()
      setSaved(true)
      toast.success(ar ? "تم حفظ نص البانر" : "Banner text saved")
    } catch (err) {
      setError(getErrorMessage(err, lang))
    } finally {
      setSaving(false)
    }
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>{ar ? "بانر البوابة" : "Portal banner"}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {ar
            ? "عدّل العنوان الرئيسي والوصف الظاهرين أعلى صفحة هذه البوابة."
            : "Edit the main heading and description shown at the top of this portal page."}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={save} className="space-y-5">
          <div className="dsc-form-grid">
            {(["en", "ar"] as const).map((language) => (
              <div
                key={language}
                className="space-y-4"
                dir={language === "ar" ? "rtl" : "ltr"}
              >
                <h3 className="font-semibold">
                  {language === "en" ? "English" : "العربية"}
                </h3>
                <div className="space-y-2">
                  <Label htmlFor={`banner-heading-${language}`}>
                    {language === "en" ? "Banner heading" : "عنوان البانر"}
                  </Label>
                  <Textarea
                    id={`banner-heading-${language}`}
                    required
                    maxLength={600}
                    rows={3}
                    value={heading[language]}
                    onChange={(event) => {
                      setHeading({ ...heading, [language]: event.target.value })
                      setSaved(false)
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`banner-description-${language}`}>
                    {language === "en" ? "Banner description" : "وصف البانر"}
                  </Label>
                  <Textarea
                    id={`banner-description-${language}`}
                    required
                    maxLength={2000}
                    rows={4}
                    value={description[language]}
                    onChange={(event) => {
                      setDescription({
                        ...description,
                        [language]: event.target.value,
                      })
                      setSaved(false)
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}
          {saved && (
            <p role="status" className="text-sm text-green-700">
              {ar
                ? "تم الحفظ. النص الجديد متاح في صفحة البوابة."
                : "Saved. The updated text is available on the portal page."}
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            <Button
              type="submit"
              disabled={saving || !dirty || !portal.recordId}
            >
              {saving
                ? ar
                  ? "جارٍ الحفظ…"
                  : "Saving…"
                : ar
                  ? "حفظ نص البانر"
                  : "Save banner text"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={saving || !dirty}
              onClick={() => {
                setHeading({ ...portal.heroTitle })
                setDescription({ ...portal.heroText })
                setError("")
                setSaved(false)
              }}
            >
              {ar ? "إلغاء التغييرات" : "Discard changes"}
            </Button>
            <Button asChild variant="outline">
              <a href={`/portal/${portal.id}`} target="_blank" rel="noreferrer">
                {ar ? "عرض البوابة" : "View portal"}
              </a>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
