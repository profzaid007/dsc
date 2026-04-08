"use client"

import { useLang } from "@/lib/lang-context"
import type { ReportConfig } from "@/types/tool"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

interface ReportPreviewProps {
  config: ReportConfig
}

export function ReportPreview({ config }: ReportPreviewProps) {
  const { lang } = useLang()

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{config.title[lang]}</h3>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Fixed Fields</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Title</Label>
            <Input placeholder="Enter report title" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Date</Label>
            <Input type="date" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {config.expertNameField[lang]}
            </Label>
            <Input placeholder="Expert name" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Assessment</Label>
            <Textarea placeholder="Enter assessment..." rows={4} />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Suggestions</Label>
            <Textarea placeholder="Enter suggestions..." rows={4} />
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
