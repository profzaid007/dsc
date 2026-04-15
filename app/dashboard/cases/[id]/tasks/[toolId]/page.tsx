"use client"

import { use, useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useProfiles } from "@/hooks/useProfiles"
import { useAssignments } from "@/hooks/useAssignments"
import { useToolTypes } from "@/hooks/useToolTypes"
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
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import type {
  SurveyConfig,
  SurveyQuestion,
  MultipleChoiceConfig,
  MCQuestion,
  MediaConfig,
  MediaItem,
  AttachmentRequestConfig,
} from "@/types/tool"
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
  const params2 = use(params)
  const caseId = params2.id
  const assignmentId = params2.toolId
  const router = useRouter()
  const { lang } = useLang()
  const { getProfileById } = useProfiles()
  const { assignments, updateAssignment } = useAssignments(caseId)
  const { getToolTypeById } = useToolTypes()

  const assignment = assignments.find((a) => a.id === assignmentId) // Find by toolId
  const profile = getProfileById(caseId) // Get profile by case ID
  const toolType = assignment ? getToolTypeById(assignment.type) : undefined
  const toolTypeName = toolType?.name || "survey"

  const isSurveyTool = toolTypeName === "survey"
  const isMultipleChoiceTool = toolTypeName === "multiple_answer"
  const isMediaTool = toolTypeName === "media_question"
  const isAttachmentTool = toolTypeName === "attachment_request"

  const surveyConfig = isSurveyTool
    ? (assignment?.config as SurveyConfig | undefined)
    : undefined
  const mcConfig = isMultipleChoiceTool
    ? (assignment?.config as MultipleChoiceConfig | undefined)
    : undefined
  const mediaConfig = isMediaTool
    ? (assignment?.config as MediaConfig | undefined)
    : undefined
  const attachmentConfig = isAttachmentTool
    ? (assignment?.config as AttachmentRequestConfig | undefined)
    : undefined

  const config = surveyConfig || mcConfig || mediaConfig || attachmentConfig

  const existingResponses = assignment?.responses as
    | Record<string, unknown>
    | undefined
  const [answers, setAnswers] = useState<Record<string, unknown>>({})
  const [mediaResponses, setMediaResponses] = useState<Record<string, string>>(
    {}
  )
  const [errors, setErrors] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isCompleted = assignment?.status === "completed"

  useEffect(() => {
    if (existingResponses && Object.keys(existingResponses).length > 0) {
      setAnswers(existingResponses)
    }
  }, [existingResponses])
  console.log(assignment)
  console.log(profile)
  console.log(config)

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

  const handleAnswer = (questionId: string, value: unknown) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
    setErrors((prev) => prev.filter((e) => e !== questionId))
  }

  const validateRequired = (): boolean => {
    const missing: string[] = []

    if (isSurveyTool && surveyConfig) {
      surveyConfig.questions.forEach((q) => {
        if (q.required) {
          const answer = answers[q.id]
          if (
            answer === undefined ||
            answer === null ||
            (typeof answer === "string" && answer.trim() === "") ||
            (Array.isArray(answer) && answer.length === 0)
          ) {
            missing.push(q.id)
          }
        }
      })
    }

    if (isMultipleChoiceTool && mcConfig) {
      mcConfig.questions.forEach((q) => {
        if (q.required) {
          const answer = answers[q.id]
          if (
            answer === undefined ||
            answer === null ||
            (typeof answer === "string" && answer.trim() === "") ||
            (typeof answer === "number" && isNaN(answer)) ||
            (Array.isArray(answer) && answer.length === 0)
          ) {
            missing.push(q.id)
          }
        }
      })
    }

    if (isMediaTool && mediaConfig) {
      mediaConfig.items.forEach((item) => {
        if (item.responseType === "text") {
          const answer = mediaResponses[item.id]
          if (!answer || answer.trim() === "") {
            missing.push(item.id)
          }
        }
      })
    }

    setErrors(missing)
    return missing.length === 0
  }

  const handleSubmit = async () => {
    if (!validateRequired()) return

    setIsSubmitting(true)
    try {
      const finalResponses =
        isMediaTool || isAttachmentTool
          ? { ...answers, ...mediaResponses }
          : answers

      await updateAssignment(assignmentId, {
        status: "completed",
        responses: finalResponses,
      })
      router.push(`/dashboard/cases/${profile.id}`)
    } catch (error) {
      console.error("Failed to submit:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStart = async () => {
    if (assignment.status === "pending") {
      await updateAssignment(assignmentId, {
        status: "in_progress",
      })
    }
  }

  const renderQuestion = (question: SurveyQuestion) => {
    const value = answers[question.id] as string | number | string[] | undefined
    const selectedRating = (value as number) ?? 0
    const hasError = errors.includes(question.id)

    return (
      <div className="space-y-3">
        <Label className="text-base font-medium">
          {question.text}
          {question.required && (
            <span className="ms-1 text-destructive">*</span>
          )}
        </Label>
        {question.answerType === "rating" && (
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
        )}
        {question.answerType === "single_choice" && (
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
                  {opt.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}
        {question.answerType === "multiple_choice" && (
          <div className="space-y-2">
            {question.options?.map((opt) => (
              <div key={opt.value} className="flex items-center gap-2">
                <Checkbox
                  id={`${question.id}-${opt.value}`}
                  checked={((value as string[]) || []).includes(opt.value)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleAnswer(question.id, [
                        ...((value as string[]) || []),
                        opt.value,
                      ])
                    } else {
                      handleAnswer(
                        question.id,
                        ((value as string[]) || []).filter(
                          (v) => v !== opt.value
                        )
                      )
                    }
                  }}
                />
                <Label htmlFor={`${question.id}-${opt.value}`}>
                  {opt.label}
                </Label>
              </div>
            ))}
          </div>
        )}
        {hasError && (
          <div className="flex items-center gap-1 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {lang === "ar" ? "إجابة مطلوبة" : "This field is required"}
          </div>
        )}
      </div>
    )
  }

  const renderMCQuestion = (question: MCQuestion) => {
    const value = answers[question.id] as string | number | string[] | undefined
    const hasError = errors.includes(question.id)

    return (
      <div className="space-y-3">
        <Label className="text-base font-medium">
          {question.text}
          {question.required && (
            <span className="ms-1 text-destructive">*</span>
          )}
        </Label>
        {question.answerType === "text" && (
          <Input
            placeholder={
              lang === "ar" ? "أدخل إجابتك..." : "Enter your answer..."
            }
            value={(value as string) || ""}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
          />
        )}
        {question.answerType === "number" && (
          <Input
            type="number"
            placeholder="0"
            value={value as string | number | undefined}
            onChange={(e) => handleAnswer(question.id, Number(e.target.value))}
          />
        )}
        {question.answerType === "single_choice" && (
          <RadioGroup
            value={(value as string) || ""}
            onValueChange={(v) => handleAnswer(question.id, v)}
          >
            {question.options?.map((opt) => (
              <div key={opt.value} className="flex items-center gap-2">
                <RadioGroupItem
                  value={opt.value}
                  id={`mc-${question.id}-${opt.value}`}
                />
                <Label htmlFor={`mc-${question.id}-${opt.value}`}>
                  {opt.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}
        {question.answerType === "multiple_choice" && (
          <div className="space-y-2">
            {question.options?.map((opt) => (
              <div key={opt.value} className="flex items-center gap-2">
                <Checkbox
                  id={`mc-${question.id}-${opt.value}`}
                  checked={((value as string[]) || []).includes(opt.value)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleAnswer(question.id, [
                        ...((value as string[]) || []),
                        opt.value,
                      ])
                    } else {
                      handleAnswer(
                        question.id,
                        ((value as string[]) || []).filter(
                          (v) => v !== opt.value
                        )
                      )
                    }
                  }}
                />
                <Label htmlFor={`mc-${question.id}-${opt.value}`}>
                  {opt.label}
                </Label>
              </div>
            ))}
          </div>
        )}
        {hasError && (
          <div className="flex items-center gap-1 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {lang === "ar" ? "إجابة مطلوبة" : "This field is required"}
          </div>
        )}
      </div>
    )
  }

  const renderMediaItem = (item: MediaItem) => (
    <div key={item.id} className="space-y-3 rounded-lg border bg-card p-4">
      <Label className="text-base font-medium">{item.question}</Label>
      {item.mediaUrl && (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-black">
          {item.mediaType === "image" && (
            <img
              src={item.mediaUrl}
              alt="Media"
              className="h-full w-full object-contain"
            />
          )}
          {item.mediaType === "video" && (
            <video
              src={item.mediaUrl}
              controls
              className="h-full w-full object-contain"
            />
          )}
          {item.mediaType === "audio" && (
            <div className="p-4">
              <audio src={item.mediaUrl} controls className="w-full" />
            </div>
          )}
        </div>
      )}
      {item.responseType === "text" && (
        <div>
          <Label className="text-sm text-muted-foreground">
            {lang === "ar" ? "إجابتك:" : "Your response:"}
          </Label>
          <Input
            placeholder={
              lang === "ar" ? "اكتب إجابتك..." : "Type your answer..."
            }
            value={mediaResponses[item.id] || ""}
            onChange={(e) => {
              setMediaResponses((prev) => ({
                ...prev,
                [item.id]: e.target.value,
              }))
              setErrors((prev) => prev.filter((e) => e !== item.id))
            }}
            className="mt-2"
          />
          {errors.includes(item.id) && (
            <div className="flex items-center gap-1 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {lang === "ar" ? "إجابة مطلوبة" : "This field is required"}
            </div>
          )}
        </div>
      )}
    </div>
  )

  const renderAttachment = () => {
    if (!attachmentConfig) return null

    return (
      <div className="space-y-4">
        <div className="rounded-lg border bg-card p-4">
          <h3 className="mb-2 text-lg font-semibold">
            {attachmentConfig.title[lang]}
          </h3>
          <p className="text-sm text-muted-foreground">
            {lang === "ar"
              ? `الحد الأقصى: ${attachmentConfig.maxFiles} ملف(ات), ${attachmentConfig.maxFileSize}MB لكل ملف`
              : `Max files: ${attachmentConfig.maxFiles}, ${attachmentConfig.maxFileSize}MB each`}
          </p>
          <p className="text-sm text-muted-foreground">
            {lang === "ar" ? "allowedTypes: " : "Allowed types: "}
            {attachmentConfig.allowedTypes.join(", ")}
          </p>
          <div className="mt-4">
            <Label className="text-base font-medium">
              {lang === "ar" ? "تحميل الملفات" : "Upload Files"}
            </Label>
            <p className="text-sm text-muted-foreground">
              {lang === "ar"
                ? "سيتم تحميل الملفات عند النقر على إرسال"
                : "Files will be uploaded when you submit"}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const displayName =
    lang === "ar"
      ? assignment.name_ar || assignment.name_en
      : assignment.name_en

  if (isCompleted) {
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
            <CardDescription>
              {lang === "ar" ? "تمت الإجابة" : "Completed"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isSurveyTool &&
              surveyConfig?.questions.map((question, idx) => (
                <div key={question.id} className="space-y-2">
                  <Label className="text-base font-medium text-muted-foreground">
                    {idx + 1}. {question.text}
                  </Label>
                  <div className="rounded-lg bg-muted/30 p-3">
                    {question.answerType === "rating" && (
                      <span className="font-medium">
                        {String(answers[question.id] || "-")} -{" "}
                        {
                          RATING_LABELS[
                            (answers[question.id] as number) || 1
                          ]?.[lang]
                        }
                      </span>
                    )}
                    {question.answerType === "single_choice" && (
                      <span className="font-medium">
                        {question.options?.find(
                          (o) => o.value === answers[question.id]
                        )?.label || "-"}
                      </span>
                    )}
                    {question.answerType === "multiple_choice" && (
                      <div className="flex flex-wrap gap-2">
                        {((answers[question.id] as string[]) || []).map((v) => (
                          <span
                            key={v}
                            className="rounded-full bg-primary/10 px-3 py-1 text-sm"
                          >
                            {
                              question.options?.find((o) => o.value === v)
                                ?.label
                            }
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

            {isMultipleChoiceTool &&
              mcConfig?.questions.map((question, idx) => (
                <div key={question.id} className="space-y-2">
                  <Label className="text-base font-medium text-muted-foreground">
                    {idx + 1}. {question.text}
                  </Label>
                  <div className="rounded-lg bg-muted/30 p-3">
                    {question.answerType === "text" && (
                      <span className="font-medium">
                        {String(answers[question.id] || "-")}
                      </span>
                    )}
                    {question.answerType === "number" && (
                      <span className="font-medium">
                        {String(answers[question.id] || "-")}
                      </span>
                    )}
                    {question.answerType === "single_choice" && (
                      <span className="font-medium">
                        {question.options?.find(
                          (o) => o.value === answers[question.id]
                        )?.label || "-"}
                      </span>
                    )}
                    {question.answerType === "multiple_choice" && (
                      <div className="flex flex-wrap gap-2">
                        {((answers[question.id] as string[]) || []).map((v) => (
                          <span
                            key={v}
                            className="rounded-full bg-primary/10 px-3 py-1 text-sm"
                          >
                            {
                              question.options?.find((o) => o.value === v)
                                ?.label
                            }
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

            {isMediaTool &&
              mediaConfig?.items.map((item) => (
                <div key={item.id} className="space-y-2">
                  <Label className="text-base font-medium text-muted-foreground">
                    {item.question}
                  </Label>
                  <div className="rounded-lg bg-muted/30 p-3">
                    <span className="font-medium">
                      {String(
                        answers[item.id] || mediaResponses[item.id] || "-"
                      )}
                    </span>
                  </div>
                </div>
              ))}

            {isAttachmentTool && (
              <div className="rounded-lg bg-muted/30 p-3">
                <p className="text-muted-foreground">
                  {lang === "ar" ? "تم رفع الملفات" : "Files uploaded"}
                </p>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() =>
                  updateAssignment(assignmentId, { status: "in_progress" })
                }
              >
                {lang === "ar" ? "تعديل الإجابات" : "Edit Answers"}
              </Button>
              <Button
                onClick={() => router.push(`/dashboard/cases/${profile.id}`)}
              >
                {lang === "ar" ? "العودة" : "Back"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

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
          {isSurveyTool &&
            surveyConfig?.questions.map((question) => (
              <div key={question.id}>{renderQuestion(question)}</div>
            ))}

          {isMultipleChoiceTool &&
            mcConfig?.questions.map((question) => (
              <div key={question.id}>{renderMCQuestion(question)}</div>
            ))}

          {isMediaTool &&
            mediaConfig?.items.map((item) => renderMediaItem(item))}

          {isAttachmentTool && renderAttachment()}

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting
              ? lang === "ar"
                ? "جاري الإرسال..."
                : "Submitting..."
              : lang === "ar"
                ? "إرسال"
                : "Submit"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
