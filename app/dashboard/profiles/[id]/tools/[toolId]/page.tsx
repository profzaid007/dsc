"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import { useProfiles } from "@/hooks/useProfiles"
import { useAssignments } from "@/hooks/useAssignments"
import { useTools } from "@/hooks/useTools"
import { useLang } from "@/lib/lang-context"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"
import type { SurveyConfig, SurveyQuestion } from "@/types/tool"

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
  const { getToolById } = useTools()

  const assignment = assignments.find((a) => a.id === assignmentId)
  const profile = assignment ? getProfileById(assignment.case) : undefined
  const tool = assignment ? getToolById(assignment.tool) : undefined
  const config = tool?.config as SurveyConfig | undefined

  const [answers, setAnswers] = useState<Record<string, unknown>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)

  if (!assignment || !profile || !tool || !config) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="mb-4 text-xl font-medium">Tool not found</h2>
        <Link href="/dashboard/profiles">
          <Button>Back to Profiles</Button>
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
              onClick={() => router.push(`/dashboard/profiles/${profile.id}`)}
            >
              Back to Profile
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

    switch (question.answerType) {
      case "text":
        return (
          <Input
            value={(value as string) || ""}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            placeholder={lang === "ar" ? "أدخل إجابتك" : "Enter your answer"}
          />
        )
      case "rating":
        return (
          <RadioGroup
            value={String(value || "")}
            onValueChange={(v) => handleAnswer(question.id, Number(v))}
            className="flex gap-4"
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="flex items-center gap-2">
                <RadioGroupItem
                  value={n.toString()}
                  id={`${question.id}-${n}`}
                />
                <Label htmlFor={`${question.id}-${n}`}>{n}</Label>
              </div>
            ))}
          </RadioGroup>
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
                  {opt.label[lang]}
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
                  {opt.label[lang]}
                </Label>
              </div>
            ))}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-primary">{tool.name[lang]}</h1>
          <p className="text-muted-foreground">{profile.name}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{tool.name.en}</CardTitle>
          {tool.description && (
            <CardDescription>{tool.description[lang]}</CardDescription>
          )}
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
