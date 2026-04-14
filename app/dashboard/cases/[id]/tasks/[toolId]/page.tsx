"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import { useProfiles } from "@/hooks/useProfiles"
import { useAssignments } from "@/hooks/useAssignments"
import { useLang } from "@/lib/lang-context"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"
import type { SurveyConfig, SurveyQuestion } from "@/types/tool"
import { cn } from "@/lib/utils"

const RATING_LABELS: Record<number, { en: string; ar: string }> = {
  1: { en: "Very Low", ar: "منخفض جداً" },
  2: { en: "Low", ar: "منخفض" },
  3: { en: "Medium", ar: "متوسط" },
  4: { en: "High", ar: "عالٍ" },
  5: { en: "Very High", ar: "عالٍ جداً" },
}

export default function TakeSurveyToolPage({
  params,
}: {
  params: Promise<{ id: string; toolId: string }>
}) {
  const { id: assignmentId } = use(params)
  const router = useRouter()
  const { lang } = useLang()
  const { getProfileById } = useProfiles()
  const { assignments, updateAssignment } = useAssignments(assignmentId)

  const assignment = assignments.find((a) => a.id === assignmentId)
  const profile = assignment ? getProfileById(assignment.case) : undefined

  // Use stored config snapshot from assignment
  const config = assignment?.config as SurveyConfig | undefined

  const [answers, setAnswers] = useState<Record<string, unknown>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)

  if (!assignment || !profile || !config) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="mb-4 text-xl font-medium">Tool not found</h2>
        <Link href="/dashboard/cases">
          <Button>Back to Cases</Button>
        </Link>
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="mb-4 h-16 w-16 text-green-600" />
            <h2 className="mb-2 text-2xl font-bold">Survey Completed!</h2>
            <p className="mb-6 text-muted-foreground">
              Thank you for completing this survey.
            </p>
            <Button
              onClick={() => router.push(`/dashboard/cases/${profile.id}`)}
            >
              Back to Case
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleAnswer = (questionId: string, value: unknown) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const handleSubmit = async () => {
    await updateAssignment(assignmentId, {
      status: "completed",
      responses: answers,
    })
    setIsSubmitted(true)
  }

  const renderQuestion = (question: SurveyQuestion) => {
    const value = answers[question.id] as string | number | string[] | undefined
    const selectedRating = (value as number) ?? 0

    switch (question.answerType) {
      case "rating":
        return (
          <div dir="ltr" className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleAnswer(question.id, rating)}
                aria-label={`${rating} - ${RATING_LABELS[rating][lang]}`}
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
                  {RATING_LABELS[rating][lang]}
                </span>
              </button>
            ))}
          </div>
        )
      case "single_choice":
        return (
          <RadioGroup
            value={(value as string) || ""}
            onValueChange={(v) => handleAnswer(question.id, v)}
          >
            {question.options?.map((opt) => (
              <div key={opt.value} className="flex items-center gap-2">
                <RadioGroupItem
                  value={opt.value}
                  id={`${question.id}-${opt.value}`}
                />
                <Label htmlFor={`${question.id}-${opt.value}`}>
                  {(opt.label as { en: string; ar: string })[lang]}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )
      case "multiple_choice":
        const currentValues = (value as string[]) || []
        return (
          <div className="space-y-2">
            {question.options?.map((opt) => (
              <div key={opt.value} className="flex items-center gap-2">
                <Checkbox
                  id={`${question.id}-${opt.value}`}
                  checked={currentValues.includes(opt.value)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleAnswer(question.id, [...currentValues, opt.value])
                    } else {
                      handleAnswer(
                        question.id,
                        currentValues.filter((v) => v !== opt.value)
                      )
                    }
                  }}
                />
                <Label htmlFor={`${question.id}-${opt.value}`}>
                  {(opt.label as { en: string; ar: string })[lang]}
                </Label>
              </div>
            ))}
          </div>
        )
      default:
        return null
    }
  }

  const displayName =
    lang === "ar"
      ? assignment.name_ar || assignment.name_en
      : assignment.name_en

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-primary">{displayName}</h1>
          <p className="text-muted-foreground">{profile.name}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{assignment.name_en}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {config.questions.map((question, idx) => (
            <div key={question.id} className="space-y-3">
              <Label className="text-base font-medium">
                {idx + 1}. {question.text[lang]}
                {question.required && (
                  <span className="ms-1 text-destructive">*</span>
                )}
              </Label>
              {renderQuestion(question)}
            </div>
          ))}
          <Button onClick={handleSubmit} className="w-full">
            Submit
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
