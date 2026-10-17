"use client"

import { useClassifications } from "@/hooks/useClassifications"
import { useLang } from "@/lib/lang-context"

export function ClassificationFields({
  main,
  keywords,
  onChange,
  disabled = false,
  required = false,
}: {
  main: string
  keywords: string
  onChange: (main: string, keywords: string) => void
  disabled?: boolean
  required?: boolean
}) {
  const { lang } = useLang()
  const { main: MAIN_CLASSIFICATIONS } = useClassifications()
  return (
    <fieldset disabled={disabled} className="grid min-w-0 gap-4 sm:grid-cols-2">
      <label className="space-y-2 text-sm font-medium">
        <span>{lang === "ar" ? "التصنيف الرئيسي" : "Main category"}</span>
        <select
          className="h-10 w-full rounded-md border bg-background px-3"
          value={main}
          required={required}
          onChange={(e) => onChange(e.target.value, keywords)}
        >
          <option value="">
            {lang === "ar" ? "اختر التصنيف" : "Select category"}
          </option>
          {main && !MAIN_CLASSIFICATIONS.some(c => c.key === main) && (
            <option value={main}>{main}</option>
          )}
          {MAIN_CLASSIFICATIONS.map((c) => (
            <option key={c.key} value={c.key}>
              {c[lang]}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-2 text-sm font-medium">
        <span>{lang === "ar" ? "الكلمات المفتاحية" : "Keywords"}</span>
        <input type="text" dir="auto" className="h-10 w-full rounded-md border bg-background px-3"
          value={keywords} maxLength={5000}
          placeholder={lang === "ar" ? "مثال: التوحد، مهارات التواصل، الأسرة" : "e.g. autism, communication, family"}
          onChange={e => onChange(main, e.target.value)} />
      </label>
    </fieldset>
  )
}
