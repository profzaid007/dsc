"use client"

import { useLang } from "@/lib/lang-context"
import type { AssessmentConfig, AssessmentStep } from "@/types/tool"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface AssessmentPreviewProps {
  config: AssessmentConfig
}

export function AssessmentPreview({ config }: AssessmentPreviewProps) {
  const { lang } = useLang()

  if (config.steps.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No steps added yet
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="py-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              {lang === "ar" ? "تقييم" : "Assessment"}
            </Badge>
            {config.settings.allowMediaUpload && (
              <Badge variant="outline">
                {lang === "ar" ? "وسائط" : "Media Upload"}
              </Badge>
            )}
            {config.settings.requireFaceToFace && (
              <Badge variant="secondary">
                {lang === "ar" ? "وجها لوجه" : "Face-to-Face"}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {config.steps.map((step, stepIdx) => (
        <Card key={step.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="h-6 w-6">
                {stepIdx + 1}
              </Badge>
              <CardTitle className="text-base">{step.title[lang]}</CardTitle>
            </div>
            {step.description && (
              <p className="text-sm text-muted-foreground">
                {step.description[lang]}
              </p>
            )}
          </CardHeader>
          <CardContent>
            {step.questions.length > 0 ? (
              <div className="space-y-3">
                {step.questions.map((question, qIdx) => (
                  <div
                    key={question.id}
                    className="flex items-start gap-2 rounded-lg bg-muted/30 p-3"
                  >
                    <Checkbox id={`step-${stepIdx}-q-${qIdx}`} />
                    <Label
                      htmlFor={`step-${stepIdx}-q-${qIdx}`}
                      className="flex-1"
                    >
                      <span className="font-medium">{question.text[lang]}</span>
                      {question.required && (
                        <span className="ms-2 text-xs text-destructive">*</span>
                      )}
                      <span className="ms-2 text-xs text-muted-foreground">
                        ({question.type})
                      </span>
                    </Label>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No questions in this step
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
