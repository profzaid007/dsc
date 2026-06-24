"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { t } from "@/lib/i18n"
import { useLang } from "@/lib/lang-context"
import { CaseTypeSelector } from "./CaseTypeSelector"
import { DynamicCaseForm } from "./DynamicCaseForm"
import { Trash2 } from "lucide-react"

export interface ChildFormData {
  id: string
  name: string
  date_of_birth: string
  gender: string
  grade: string
  caseTypeId: string
  caseTypeKey: string
  formData: Record<string, string>
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

  const updateField = (field: keyof ChildFormData, value: any) => {
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
            <Input
              type="date"
              value={data.date_of_birth}
              onChange={(e) => updateField("date_of_birth", e.target.value)}
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
              <SelectContent>
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

        <CaseTypeSelector
          value={data.caseTypeId}
          onChange={(id, key) => {
            updateField("caseTypeId", id)
            updateField("caseTypeKey", key)
            updateField("formData", {})
          }}
          required
        />

        {data.caseTypeKey && (
          <div className="pt-2 border-t">
            <p className="text-sm font-medium mb-3">
              {t(
                { en: "Case Details", ar: "تفاصيل الحالة" },
                lang
              )}
            </p>
            <DynamicCaseForm
              caseTypeKey={data.caseTypeKey}
              values={data.formData}
              onChange={(fieldId, value) => {
                updateField("formData", {
                  ...data.formData,
                  [fieldId]: value,
                })
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
