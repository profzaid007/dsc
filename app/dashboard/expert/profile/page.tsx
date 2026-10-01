"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { PageLoader } from "@/components/ui/page-loader"
import { ExpertProfileView } from "@/components/expert/ExpertProfileView"
import { ExpertProfileEditor } from "@/components/expert/ExpertProfileEditor"
import { useAuth } from "@/hooks/useAuth"
import {
  draftFromProfile,
  profileFileUrl,
  profilePhotoName,
  useExpertProfile,
} from "@/hooks/useExpertProfile"
import { getErrorMessage, getFieldErrors } from "@/lib/pb"
import { t } from "@/lib/i18n"
import { useLang } from "@/lib/lang-context"
import type { ExpertProfileDraft } from "@/types/expert"

export default function ExpertProfilePage() {
  const { currentUser } = useAuth()
  const { lang } = useLang()
  const { profile, fileToken, isLoading, isSaving, loadError, save } =
    useExpertProfile(currentUser?.id)

  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState<ExpertProfileDraft | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const storedPhotoUrl = profileFileUrl(
    profile,
    profilePhotoName(profile),
    fileToken
  )

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <PageLoader text={t({ en: "Loading profile...", ar: "جارٍ تحميل الملف..." }, lang)} />
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-primary">
          {t({ en: "My Profile", ar: "ملفي الشخصي" }, lang)}
        </h1>
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {loadError}
        </div>
        <Button variant="outline" onClick={() => window.location.reload()}>
          {t({ en: "Retry", ar: "إعادة المحاولة" }, lang)}
        </Button>
      </div>
    )
  }

  const startEditing = () => {
    setDraft(draftFromProfile(profile, currentUser?.name ?? ""))
    setFieldErrors({})
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setDraft(null)
    setFieldErrors({})
    setIsEditing(false)
  }

  const handleSubmit = async () => {
    if (!draft) return

    if (!draft.name.trim()) {
      setFieldErrors({
        name: t(
          { en: "This field is required.", ar: "هذا الحقل مطلوب." },
          lang
        ),
      })
      return
    }

    setFieldErrors({})
    try {
      await save(draft)
      toast.success(
        t(
          { en: "Profile updated successfully.", ar: "تم تحديث الملف بنجاح." },
          lang
        )
      )
      setIsEditing(false)
      setDraft(null)
    } catch (error) {
      const errors = getFieldErrors(error, lang)
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors)
      } else {
        toast.error(
          getErrorMessage(
            error,
            lang
          ) ||
            t(
              {
                en: "Failed to save your profile. Please try again.",
                ar: "تعذّر حفظ ملفك. يرجى المحاولة مرة أخرى.",
              },
              lang
            )
        )
      }
    }
  }

  if (isEditing && draft) {
    return (
      <ExpertProfileEditor
        draft={draft}
        onChange={setDraft}
        email={currentUser?.email ?? ""}
        photoUrl={storedPhotoUrl}
        fieldErrors={fieldErrors}
        isSaving={isSaving}
        onCancel={cancelEditing}
        onSubmit={handleSubmit}
      />
    )
  }

  return (
    <ExpertProfileView
      name={currentUser?.name ?? ""}
      email={currentUser?.email ?? ""}
      profile={profile}
      fileToken={fileToken}
      onEdit={startEditing}
    />
  )
}