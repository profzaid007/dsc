"use client"

import { useLang } from "@/lib/lang-context"
import type { BilingualString, ReportConfig } from "@/types/tool"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function ReportPreview({ config }: { config: ReportConfig }) {
  const { lang } = useLang()

  const getBilingualValue = (value?: string | BilingualString) => {
    if (!value) return ""
    return typeof value === "string" ? value : value[lang] || ""
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{config.title[lang]}</h3>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Child:</span>{" "}
              {config.childName || "-"}
            </div>
            <div>
              <span className="font-medium">Expert:</span>{" "}
              {config.expertName || "-"}
            </div>
            {config.date && (
              <div>
                <span className="font-medium">Date:</span> {config.date}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={getBilingualValue(config.assessment)}
            readOnly
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Suggestions</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={getBilingualValue(config.suggestions)}
            readOnly
            rows={4}
          />
        </CardContent>
      </Card>
    </div>
  )
}
