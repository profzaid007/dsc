"use client"

import { Input } from "@/components/ui/input"
import { DateInput } from "@/components/ui/date-input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import {
  PortalServiceSelector,
  type PortalServiceValue,
} from "./PortalServiceSelector"
import { Trash2 } from "lucide-react"

export interface ChildFormData {
  id: string
  name: string
  date_of_birth: string
  gender: string
  grade: string
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>
              {t({ en: "Child Name", ar: "اسم الطفل" }, lang)}
              <span className="text-red-500 ml-1">*</span>
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
            <Label>
              {t({ en: "Date of Birth", ar: "تاريخ الميلاد" }, lang)}
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <DateInput
              value={data.date_of_birth}
              onChange={(v) => updateField("date_of_birth", v)}
            />
          </div>

          <div className="space-y-2">
            <Label>
              {t({ en: "Gender", ar: "الجنس" }, lang)}
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Select
              value={data.gender}
              onValueChange={(value) => updateField("gender", value)}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={t(
                    { en: "Select gender", ar: "اختر الجنس" },
                    lang
                  )}
                />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="male">
                  {t({ en: "Male", ar: "ذكر" }, lang)}
                </SelectItem>
                <SelectItem value="female">
                  {t({ en: "Female", ar: "أنثى" }, lang)}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

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
        </div>

        <PortalServiceSelector
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
