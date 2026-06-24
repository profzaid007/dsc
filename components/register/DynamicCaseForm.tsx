"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { t } from "@/lib/i18n"
import { useLang } from "@/lib/lang-context"
import { getCaseTypeFormFields, type CaseTypeField } from "@/lib/case-type-forms"

interface DynamicCaseFormProps {
  caseTypeKey: string
  values: Record<string, string>
  onChange: (fieldId: string, value: string) => void
  prefix?: string
}

export function DynamicCaseForm({
  caseTypeKey,
  values,
  onChange,
  prefix = "",
}: DynamicCaseFormProps) {
  const { lang } = useLang()
  const fields = getCaseTypeFormFields(caseTypeKey)

  if (fields.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">
        {t(
          {
            en: "No specific form for this case type.",
            ar: "لا يوجد نموذج محدد لنوع الحالة هذا.",
          },
          lang
        )}
      </p>
    )
  }

  function renderField(field: CaseTypeField) {
    const fieldName = `${prefix}${field.id}`
    const fieldValue = values[field.id] || ""

    const label = (
      <Label htmlFor={fieldName}>
        {t(field.label, lang)}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
    )

    switch (field.type) {
      case "text":
        return (
          <div key={field.id} className="space-y-2">
            {label}
            <Input
              id={fieldName}
              value={fieldValue}
              onChange={(e) => onChange(field.id, e.target.value)}
              placeholder={
                field.placeholder ? t(field.placeholder, lang) : undefined
              }
            />
          </div>
        )
      case "textarea":
        return (
          <div key={field.id} className="space-y-2">
            {label}
            <Textarea
              id={fieldName}
              value={fieldValue}
              onChange={(e) => onChange(field.id, e.target.value)}
              placeholder={
                field.placeholder ? t(field.placeholder, lang) : undefined
              }
              rows={3}
            />
          </div>
        )
      case "select":
        return (
          <div key={field.id} className="space-y-2">
            {label}
            <Select
              value={fieldValue}
              onValueChange={(value) => onChange(field.id, value)}
            >
              <SelectTrigger id={fieldName}>
                <SelectValue
                  placeholder={t(
                    { en: "Select an option", ar: "اختر خياراً" },
                    lang
                  )}
                />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {t(option.label, lang)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )
      default:
        return null
    }
  }

  return <div className="space-y-4">{fields.map(renderField)}</div>
}
