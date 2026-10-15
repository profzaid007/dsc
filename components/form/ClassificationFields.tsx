"use client"

import { useEffect, useState } from "react"
import { useLang } from "@/lib/lang-context"
import { MAIN_CLASSIFICATIONS, classificationParent } from "@/lib/classification"
import { blogCategoriesCollection } from "@/lib/pb-collections"
import type { BlogCategory } from "@/types/cms"

export function ClassificationFields({ main, sub, onChange, disabled = false, required = false }: {
  main: string; sub: string; onChange: (main: string, sub: string) => void; disabled?: boolean; required?: boolean
}) {
  const { lang } = useLang()
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [error, setError] = useState(false)
  useEffect(() => { let active = true; blogCategoriesCollection.getAll().then(data => { if (active) setCategories(data) }).catch(() => { if (active) setError(true) }); return () => { active = false } }, [])
  const children = categories.filter(c => (c.main_category || classificationParent(c.key)) === main)
  return <fieldset disabled={disabled} className="grid min-w-0 gap-4 sm:grid-cols-2">
    <label className="space-y-2 text-sm font-medium">
      <span>{lang === "ar" ? "التصنيف الرئيسي" : "Main category"}</span>
      <select className="h-10 w-full rounded-md border bg-background px-3" value={main} required={required} onChange={e => onChange(e.target.value, "")}>
        <option value="">{lang === "ar" ? "اختر التصنيف" : "Select category"}</option>
        {MAIN_CLASSIFICATIONS.map(c => <option key={c.key} value={c.key}>{c[lang]}</option>)}
      </select>
    </label>
    <label className="space-y-2 text-sm font-medium">
      <span>{lang === "ar" ? "التصنيف الفرعي" : "Subcategory"}</span>
      <select className="h-10 w-full rounded-md border bg-background px-3" value={sub} disabled={!main || error} onChange={e => onChange(main, e.target.value)}>
        <option value="">{lang === "ar" ? "بدون تصنيف فرعي" : "No subcategory"}</option>
        {sub && !children.some(c => c.key === sub) && <option value={sub}>{sub}</option>}
        {children.map(c => <option key={c.key} value={c.key}>{lang === "ar" ? c.label_ar || c.label_en : c.label_en}</option>)}
      </select>
      {error && <span role="alert">{lang === "ar" ? "تعذر تحميل التصنيفات الفرعية" : "Could not load subcategories"}</span>}
    </label>
  </fieldset>
}
