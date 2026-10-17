"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLang } from "@/lib/lang-context"
import { t } from "@/lib/i18n"

export interface ExpertPublicDetails {
  publicNameEn: string
  publicNameAr: string
  publicQualificationEn: string
  publicQualificationAr: string
  publicSpecialtyEn: string
  publicSpecialtyAr: string
}

export function ExpertPublicDetailsFields({
  values,
  onChange,
  namesOnly = false,
  omitNames = false,
}: {
  namesOnly?: boolean
  omitNames?: boolean
  values: ExpertPublicDetails
  onChange: (change: Partial<ExpertPublicDetails>) => void
}) {
  const { lang } = useLang()
  const fields = [
    {
      key: "publicNameAr",
      en: "Full name (Arabic)",
      ar: "الاسم الكامل بالعربية",
      dir: "rtl",
      max: 100,
    },
    {
      key: "publicNameEn",
      en: "Full name (English)",
      ar: "الاسم الكامل بالإنجليزية",
      dir: "ltr",
      max: 100,
    },
    {
      key: "publicQualificationEn",
      en: "Certificate title (English)",
      ar: "عنوان الشهادة بالإنجليزية",
      dir: "ltr",
      max: 200,
    },
    {
      key: "publicQualificationAr",
      en: "Certificate title (Arabic)",
      ar: "عنوان الشهادة بالعربية",
      dir: "rtl",
      max: 200,
    },
    {
      key: "publicSpecialtyEn",
      en: "Specialty (English)",
      ar: "التخصص بالإنجليزية",
      dir: "ltr",
      max: 200,
    },
    {
      key: "publicSpecialtyAr",
      en: "Specialty (Arabic)",
      ar: "التخصص بالعربية",
      dir: "rtl",
      max: 200,
    },
  ] as const
  return (
    <fieldset className="space-y-4 md:col-span-2">
      {!namesOnly && <><legend className="font-semibold">
        {t({ en: "Public team display", ar: "بيانات عرض فريق الخبراء" }, lang)}
      </legend>
      <p className="text-sm text-muted-foreground">
        {t(
          {
            en: "Enter the text visitors will see in each language. These display specialties do not change the services used for case assignment.",
            ar: "أدخل النص الذي سيظهر للزوار بكل لغة. لا يغيّر نص التخصص المعروض الخدمات المستخدمة لإسناد الحالات.",
          },
          lang
        )}
      </p></>}
      <div className="dsc-form-grid">
        {fields.filter((field) => namesOnly ? field.key.startsWith("publicName") : omitNames ? !field.key.startsWith("publicName") : true).map((field) => (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={`expert-${field.key}`}>
              {t({ en: field.en, ar: field.ar }, lang)}
            </Label>
            <Input
              id={`expert-${field.key}`}
              dir={field.dir}
              value={values[field.key]}
              maxLength={field.max}
              required={field.key.startsWith("publicName")}
              onChange={(event) =>
                onChange({ [field.key]: event.target.value })
              }
            />
          </div>
        ))}
      </div>
    </fieldset>
  )
}
