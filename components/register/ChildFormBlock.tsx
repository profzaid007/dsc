"use client"

import { useId } from "react"
import { Input } from "@/components/ui/input"
import { DateInput } from "@/components/ui/date-input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { t } from "@/lib/i18n"
import { useLang } from "@/lib/lang-context"
import {
  PortalServiceSelector,
  type PortalServiceValue,
} from "./PortalServiceSelector"
import { PARENT_CASE_SERVICE_IDS } from "@/lib/portals"
import { Trash2 } from "lucide-react"

export interface ChildFormData {
  id: string
  name: string
  date_of_birth: string
  gender: string
  grade: string
  relationship: string
  portalService: PortalServiceValue
  notes: string
}

interface ChildFormBlockProps {
  index: number
  data: ChildFormData
  onChange: (data: ChildFormData) => void
  onRemove: () => void
  canRemove: boolean
}

export function ChildFormBlock({
  index,
  data,
  onChange,
  onRemove,
  canRemove,
}: ChildFormBlockProps) {
  const { lang } = useLang()
  const genderGroupId = useId()

  const updateField = <K extends keyof ChildFormData>(
    field: K,
    value: ChildFormData[K]
  ) => {
    onChange({ ...data, [field]: value })
  }

  return (
    <Card className="border border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">
          {t({ en: "Child", ar: "الطفل" }, lang)} #{index + 1}
        </CardTitle>
        {canRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            {t({ en: "Remove", ar: "إزالة" }, lang)}
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="dsc-form-grid">
          <div className="space-y-2">
            <Label required>
              {t({ en: "Child Name", ar: "اسم الطفل" }, lang)}
            </Label>
            <Input
              value={data.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder={t(
                { en: "e.g. Ahmed", ar: "مثال: أحمد" },
                lang
              )}
            />
          </div>

          <div className="space-y-2">
            <Label required>
              {t({ en: "Date of Birth", ar: "تاريخ الميلاد" }, lang)}
            </Label>
            <DateInput
              value={data.date_of_birth}
              onChange={(v) => updateField("date_of_birth", v)}
              maxDate={new Date()}
            />
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">
              {t({ en: "Gender", ar: "الجنس" }, lang)}
              <span aria-hidden="true" className="ms-1 text-red-500">*</span>
            </legend>
            <div className="flex flex-wrap gap-3">
              {([
                { value: "male", en: "Male", ar: "ذكر" },
                { value: "female", en: "Female", ar: "أنثى" },
              ] as const).map((option) => (
                <label key={option.value} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-input px-4 py-2 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                  <input
                    type="radio"
                    name={`child-${genderGroupId}-gender`}
                    value={option.value}
                    checked={data.gender === option.value}
                    onChange={() => updateField("gender", option.value)}
                    className="size-4 accent-primary"
                  />
                  {t(option, lang)}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="space-y-2">
            <Label>
              {t({ en: "Grade", ar: "الصف" }, lang)}
            </Label>
            <Input
              value={data.grade}
              onChange={(e) => updateField("grade", e.target.value)}
              placeholder={t(
                { en: "e.g. Grade 3", ar: "مثال: الصف الثالث" },
                lang
              )}
            />
          </div>

          <div className="space-y-2">
            <Label required>
              {t({ en: "Relationship to Child", ar: "صلة القرابة بالطفل" }, lang)}
            </Label>
            <Input
              value={data.relationship}
              onChange={(e) => updateField("relationship", e.target.value)}
              placeholder={t(
                { en: "e.g. Father", ar: "مثال: أب" },
                lang
              )}
            />
          </div>
        </div>

        <PortalServiceSelector
          allowedPortalIds={PARENT_CASE_SERVICE_IDS}
          value={data.portalService}
          onChange={(value) => updateField("portalService", value)}
          required
        />

        <div className="space-y-2">
          <Label>
            {t({ en: "Notes", ar: "ملاحظات" }, lang)}
          </Label>
          <Textarea
            value={data.notes}
            onChange={(e) => updateField("notes", e.target.value)}
            placeholder={t(
              {
                en: "Add any additional notes about this case...",
                ar: "أضف أي ملاحظات إضافية حول هذه الحالة...",
              },
              lang
            )}
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  )
}
