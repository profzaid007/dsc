"use client"

import { useState } from "react"
import { useLang } from "@/lib/lang-context"
import type { SurveyConfig, SurveyQuestion } from "@/types/tool"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface SurveyPreviewProps {
  config: SurveyConfig
}

const RATING_LABELS: Record<number, { en: string; ar: string }> = {
  1: { en: "Very Low", ar: "منخفض جداً" },
  2: { en: "Low", ar: "منخفض" },
  3: { en: "Medium", ar: "متوسط" },
  4: { en: "High", ar: "عالٍ" },
  5: { en: "Very High", ar: "عالٍ جداً" },
}

function t(label: { en: string; ar: string }, lang: "en" | "ar"): string {
  return label[lang]
}

export function SurveyPreview({ config }: SurveyPreviewProps) {
  const { lang } = useLang()
  const [answers, setAnswers] = useState<Record<string, unknown>>({})

  const handleAnswer = (questionId: string, value: unknown) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const renderQuestion = (question: SurveyQuestion, index: number) => {
    const value = answers[question.id] as string | number | string[] | undefined
    const selectedRating = (value as number) ?? 0

    return (
      <div
        key={question.id}
        className="space-y-3 rounded-lg border bg-card p-4"
      >
        <div className="flex items-start gap-2">
          <Badge variant="outline" className="mt-0.5">
            {index + 1}
          </Badge>
          <Label className="flex-1 font-medium">
            {question.text[lang]}
            {question.required && (
              <span className="ms-1 text-destructive">*</span>
            )}
          </Label>
        </div>

        <div className="ms-7">
          {question.answerType === "rating" && (
            <div dir="ltr" className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => handleAnswer(question.id, rating)}
                  aria-label={`${rating} - ${t(RATING_LABELS[rating], lang)}`}
                  aria-pressed={selectedRating === rating}
                  className={cn(
                    "flex h-12 w-12 flex-col items-center justify-center rounded-lg border-2 text-sm font-semibold transition-all duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                    selectedRating === rating
                      ? "border-transparent text-white"
                      : "border-border bg-background text-muted-foreground hover:border-accent hover:text-accent"
                  )}
                  style={
                    selectedRating === rating
                      ? {
                          backgroundColor: "var(--dsc-gold)",
                          borderColor: "var(--dsc-gold)",
                        }
                      : {}
                  }
                >
                  <span className="text-base">{rating}</span>
                  <span className="text-[10px] leading-tight opacity-80">
                    {t(RATING_LABELS[rating], lang)}
                  </span>
                </button>
              ))}
            </div>
          )}
          {(question.answerType === "single_choice" ||
            question.answerType === "multiple_choice") &&
            (question.answerType === "single_choice" ? (
              <RadioGroup
                value={(value as string) || ""}
                onValueChange={(v) => handleAnswer(question.id, v)}
              >
                {question.options?.map((opt) => (
                  <div key={opt.value} className="flex items-center gap-2">
                    <RadioGroupItem
                      value={opt.value}
                      id={`preview-${question.id}-${opt.value}`}
                    />
                    <Label htmlFor={`preview-${question.id}-${opt.value}`}>
                      {opt.label[lang]}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <div className="space-y-2">
                {question.options?.map((opt) => (
                  <div key={opt.value} className="flex items-center gap-2">
                    <Checkbox
                      id={`preview-${question.id}-${opt.value}`}
                      checked={((value as string[]) || []).includes(opt.value)}
                      onCheckedChange={(checked) => {
                        const current = (value as string[]) || []
                        if (checked) {
                          handleAnswer(question.id, [...current, opt.value])
                        } else {
                          handleAnswer(
                            question.id,
                            current.filter((v) => v !== opt.value)
                          )
                        }
                      }}
                    />
                    <Label htmlFor={`preview-${question.id}-${opt.value}`}>
                      {opt.label[lang]}
                    </Label>
                  </div>
                ))}
              </div>
            ))}
        </div>
      </div>
    )
  }

  const sortedQuestions = [...config.questions].sort(
    (a, b) => a.order - b.order
  )

  if (sortedQuestions.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No questions yet
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{config.title[lang]}</h3>
      {sortedQuestions.map((q, idx) => renderQuestion(q, idx))}
      <div className="rounded-lg bg-muted/30 p-4">
        <p className="mb-2 text-sm font-medium">Answers:</p>
        <pre className="overflow-auto text-xs">
          {JSON.stringify(answers, null, 2)}
        </pre>
      </div>
    </div>
  )
}
