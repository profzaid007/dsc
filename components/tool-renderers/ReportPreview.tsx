"use client"

import { useState, useEffect } from "react"
import { useLang } from "@/lib/lang-context"
import type { ReportConfig } from "@/types/tool"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

interface ReportPreviewProps {
  config: ReportConfig
  onChange?: (
    field: "date" | "assessment" | "suggestions",
    value: string
  ) => void
}

export function ReportPreview({ config, onChange }: ReportPreviewProps) {
  const { lang } = useLang()

  // Local state to track preview values (like PlanPreview does)
  // Initialize with config values if available
  const [fieldValues, setFieldValues] = useState<{
    date: string
    assessment: string
    suggestions: string
  }>({
    date: config.date || "",
    assessment: config.assessment || "",
    suggestions: config.suggestions || "",
  })

  // Sync with config changes from parent (form inputs)
  useEffect(() => {
    setFieldValues({
      date: config.date || "",
      assessment: config.assessment || "",
      suggestions: config.suggestions || "",
    })
  }, [config.date, config.assessment, config.suggestions])

  const updateField = (
    field: "date" | "assessment" | "suggestions",
    value: string
  ) => {
    setFieldValues((prev) => ({ ...prev, [field]: value }))
    onChange?.(field, value)
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{config.title[lang]}</h3>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Report Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Date</Label>
            <Input
              type="date"
              value={fieldValues.date}
              onChange={(e) => updateField("date", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {config.expertNameField[lang]}
            </Label>
            <Input
              placeholder="Expert name"
              value={config.expertNameField[lang]}
              readOnly
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Assessment</Label>
            <Textarea
              placeholder="Enter assessment..."
              rows={4}
              value={fieldValues.assessment}
              onChange={(e) => updateField("assessment", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Suggestions</Label>
            <Textarea
              placeholder="Enter suggestions..."
              rows={4}
              value={fieldValues.suggestions}
              onChange={(e) => updateField("suggestions", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {config.customFields.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Custom Fields</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {config.customFields.map((field) => (
              <div key={field.id} className="space-y-2">
                <Label className="text-sm font-medium">
                  {field.label[lang]}
                </Label>
                {field.type === "text" && <Input placeholder="Enter value" />}
                {field.type === "textarea" && (
                  <Textarea placeholder="Enter text..." rows={3} />
                )}
                {field.type === "date" && <Input type="date" />}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Button className="w-full">Submit Report</Button>
    </div>
  )
}
