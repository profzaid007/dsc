"use client"

import { useEffect, useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { t } from "@/lib/i18n"
import { useLang } from "@/lib/lang-context"
import pb from "@/lib/pb"
import type { LookupEntry } from "@/types/lookup"

interface CaseTypeSelectorProps {
  value?: string
  onChange: (caseTypeId: string, caseTypeKey: string) => void
  label?: string
  required?: boolean
}

export function CaseTypeSelector({
  value,
  onChange,
  label,
  required = false,
}: CaseTypeSelectorProps) {
  const { lang } = useLang()
  const [caseTypes, setCaseTypes] = useState<LookupEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchCaseTypes() {
      try {
        const data = await pb
          .collection("lookups")
          .getFullList({ filter: 'type = "case_types"' })
        setCaseTypes(data as unknown as LookupEntry[])
      } catch (error) {
        console.error("Failed to fetch case types:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchCaseTypes()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label>{label || t({ en: "Case Type", ar: "نوع الحالة" }, lang)}</Label>
        <div className="h-8 w-full animate-pulse rounded-lg bg-muted" />
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Label>
        {label || t({ en: "Case Type", ar: "نوع الحالة" }, lang)}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Select
        value={value}
        onValueChange={(id) => {
          const selected = caseTypes.find((ct) => ct.id === id)
          if (selected) {
            onChange(id, selected.key)
          }
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue
            placeholder={t(
              { en: "Select case type", ar: "اختر نوع الحالة" },
              lang
            )}
          />
        </SelectTrigger>
        <SelectContent>
          {caseTypes.map((caseType) => (
            <SelectItem key={caseType.id} value={caseType.id}>
              {t(
                { en: caseType.label_en, ar: caseType.label_ar },
                lang
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
