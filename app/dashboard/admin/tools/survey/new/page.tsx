"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTools } from "@/hooks/useTools"
import { useLang } from "@/lib/lang-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DragList } from "@/components/ui/drag-list"
import { SurveyPreview } from "@/components/tool-renderers/SurveyPreview"
import { ArrowLeft, Plus, Trash2, Eye, EyeOff } from "lucide-react"
import type {
  SurveyConfig,
  SurveyQuestion,
  SurveyAnswerType,
} from "@/types/tool"
import { useToolTypes } from "@/hooks/useToolTypes"
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
const ANSWER_TYPES: { value: SurveyAnswerType; label: string }[] = [
  { value: "single_choice", label: "Single Choice" },
  { value: "multiple_choice", label: "Multiple Choice" },
  { value: "rating", label: "Rating (Severity)" },
]
const DEFAULT_OPTIONS = [
  { value: "opt1", label: "Option 1" },
  { value: "opt2", label: "Option 2" },
  { value: "opt3", label: "Option 3" },
  { value: "opt4", label: "Option 4" },
  { value: "opt5", label: "Option 5" },
]
interface SurveyBuilderPageProps {
  params?: Promise<{ id?: string }>
}
export default function SurveyBuilderPage({
  params,
}: SurveyBuilderPageProps = {}) {
  const router = useRouter()
  const { lang } = useLang()
  const {
    addTool,
    updateTool,
    getToolById,
    isLoading: isToolsLoading,
  } = useTools()
  const { toolTypes, fetchToolTypes } = useToolTypes()
  const [showPreview, setShowPreview] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const resolvedParams = params ? use(params) : undefined
  const editId = resolvedParams?.id
  const isEditMode = !!editId
  const [formData, setFormData] = useState({
    nameEn: "",
    nameAr: "",
  })
  const [questions, setQuestions] = useState<SurveyQuestion[]>([])
  useEffect(() => {
    if (isEditMode && editId && !isToolsLoading) {
      setIsLoading(true)
      const tool = getToolById(editId)
      if (tool && tool.config) {
        const config = tool.config as SurveyConfig
        setFormData({
          nameEn: tool.name.en,
          nameAr: tool.name.ar,
        })
        setQuestions(config.questions || [])
      }
      setIsLoading(false)
    }
  }, [isEditMode, editId, isToolsLoading])
  const addQuestion = () => {
    const newQuestion: SurveyQuestion = {
      id: generateId(),
      text: "",
      answerType: "single_choice",
      options: [...DEFAULT_OPTIONS],
      required: false,
      order: questions.length,
    }
    setQuestions([...questions, newQuestion])
  }
  const updateQuestion = (id: string, updates: Partial<SurveyQuestion>) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, ...updates } : q)))
  }
  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id))
  }
  const handleReorder = (reordered: SurveyQuestion[]) => {
    setQuestions(reordered)
  }
  const handleSubmit = async () => {
    if (!formData.nameEn || questions.length === 0) return
    setIsSubmitting(true)
    const config: SurveyConfig = {
      title: { en: formData.nameEn, ar: formData.nameAr },
      questions: questions.map((q, idx) => ({ ...q, order: idx })),
      media: [],
    }
    if (isEditMode && editId) {
      await updateTool(editId, {
        name: { en: formData.nameEn, ar: formData.nameAr },
        config,
      })
      router.push(`/dashboard/admin/tools/survey/${editId}`)
    } else {
      const toolTypes = await fetchToolTypes()
      const type = toolTypes.find((t) => t.name === "survey")?.id

      await addTool({
        name: { en: formData.nameEn, ar: formData.nameAr },
        type: type,
        serviceType: "individual",
        status: "active",
        config,
      })
      router.push(`/dashboard/admin/tools`)
    }
  }
  const renderQuestionItem = (question: SurveyQuestion, index: number) => {
    const showOptions =
      question.answerType === "single_choice" ||
      question.answerType === "multiple_choice"
    return (
      <div className="flex-1 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Question {index + 1}</span>
          <div className="flex items-center gap-2">
            <Checkbox
              id={`req-${question.id}`}
              checked={question.required}
              onCheckedChange={(checked) =>
                updateQuestion(question.id, { required: !!checked })
              }
            />
            <Label htmlFor={`req-${question.id}`} className="text-xs">
              Required
            </Label>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => removeQuestion(question.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
        <Input
          placeholder="Question"
          value={question.text}
          onChange={(e) =>
            updateQuestion(question.id, {
              text: e.target.value,
            })
          }
        />
        <Select
          value={question.answerType}
          onValueChange={(v) =>
            updateQuestion(question.id, { answerType: v as SurveyAnswerType })
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ANSWER_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {showOptions && (
          <div className="space-y-2 rounded-md border p-3">
            <Label className="text-xs">Options</Label>
            {question.options.map((opt, optIdx) => (
              <div key={opt.value} className="flex gap-2">
                <Input
                  placeholder="Option"
                  value={opt.label}
                  onChange={(e) => {
                    const newOptions = question.options.map((o, i) =>
                      i === optIdx
                        ? {
                            ...o,
                            label: e.target.value,
                          }
                        : o
                    )
                    updateQuestion(question.id, { options: newOptions })
                  }}
                  className="flex-1"
                />
              </div>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                const newOptions = [
                  ...question.options,
                  {
                    value: generateId(),
                    label: `Option ${question.options.length + 1}`,
                  },
                ]
                updateQuestion(question.id, { options: newOptions })
              }}
            >
              <Plus className="me-1 h-3 w-3" />
              Add Option
            </Button>
          </div>
        )}
      </div>
    )
  }
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-primary">
              {isEditMode ? "Edit Survey" : "Create Survey"}
            </h1>
            <p className="text-muted-foreground">
              {isEditMode
                ? "Update survey questions and answer options"
                : "Build a survey with questions and answer options"}
            </p>
          </div>
        </div>
        <Button
          variant={showPreview ? "default" : "outline"}
          onClick={() => setShowPreview(!showPreview)}
        >
          {showPreview ? (
            <EyeOff className="me-2 h-4 w-4" />
          ) : (
            <Eye className="me-2 h-4 w-4" />
          )}
          {showPreview ? "Hide Preview" : "Preview"}
        </Button>
      </div>
      <div
        className={`grid gap-6 ${showPreview ? "lg:grid-cols-2" : "grid-cols-1"}`}
      >
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Survey Name (EN)</Label>
                  <Input
                    value={formData.nameEn}
                    onChange={(e) =>
                      setFormData({ ...formData, nameEn: e.target.value })
                    }
                    placeholder="Survey title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Survey Name (AR)</Label>
                  <Input
                    value={formData.nameAr}
                    onChange={(e) =>
                      setFormData({ ...formData, nameAr: e.target.value })
                    }
                    placeholder="عنوان الاستبيان"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Questions</CardTitle>
              <Button size="sm" onClick={addQuestion}>
                <Plus className="me-2 h-4 w-4" />
                Add Question
              </Button>
            </CardHeader>
            <CardContent>
              {questions.length === 0 ? (
                <p className="py-4 text-center text-muted-foreground">
                  No questions yet. Add one to start.
                </p>
              ) : (
                <DragList
                  items={questions}
                  onReorder={handleReorder}
                  renderItem={renderQuestionItem}
                  keyExtractor={(q) => q.id}
                />
              )}
            </CardContent>
          </Card>
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                !formData.nameEn || questions.length === 0 || isSubmitting
              }
            >
              {isSubmitting
                ? isEditMode
                  ? "Saving..."
                  : "Creating..."
                : isEditMode
                  ? "Save Changes"
                  : "Create Survey"}
            </Button>
          </div>
        </div>
        {showPreview && (
          <div className="sticky top-6 max-h-[calc(100vh-12rem)] overflow-auto rounded-lg border bg-card p-4">
            <p className="mb-4 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
              Live Preview
            </p>
            <SurveyPreview
              config={{
                title: { en: formData.nameEn, ar: formData.nameAr },
                questions,
                media: [],
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
