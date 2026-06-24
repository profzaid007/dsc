"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTools } from "@/hooks/useTools"
import { useAssignments } from "@/hooks/useAssignments"
import { useProfiles } from "@/hooks/useProfiles"
import { useLang } from "@/lib/lang-context"
import { caseToolsCollection } from "@/lib/pb-collections"
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
import { MultipleChoicePreview } from "@/components/tool-renderers/MultipleChoicePreview"
import { MediaUpload } from "@/components/ui/media-upload"
import {
  ArrowLeft,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle,
  Image,
  Video,
  Music,
  X,
} from "lucide-react"
import type {
  MultipleChoiceConfig,
  MCQuestion,
  MCAnswerType,
  MediaType,
  ResponseType,
} from "@/types/tool"
import { useToolTypes } from "@/hooks/useToolTypes"
import pb from "@/lib/pb"

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

const ANSWER_TYPES: { value: MCAnswerType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "single_choice", label: "Single Choice (mark correct)" },
  { value: "multiple_choice", label: "Multiple Choice (mark correct)" },
]

const DEFAULT_OPTIONS = [
  { value: "opt1", label: "Option 1", isCorrect: false },
  { value: "opt2", label: "Option 2", isCorrect: false },
  { value: "opt3", label: "Option 3", isCorrect: false },
  { value: "opt4", label: "Option 4", isCorrect: false },
  { value: "opt5", label: "Option 5", isCorrect: false },
]

interface MultipleChoiceBuilderPageProps {
  params?: Promise<{ id?: string }>
  searchParams?: Promise<{ caseId?: string }>
}

export default function MultipleChoiceBuilderPage({
  params,
  searchParams,
}: MultipleChoiceBuilderPageProps = {}) {
  const router = useRouter()
  const { lang } = useLang()
  const { updateTool, getToolById, isLoading: isToolsLoading } = useTools()
  const { assignTool } = useAssignments()
  const { getProfileById } = useProfiles()
  const { toolTypes, fetchToolTypes } = useToolTypes()
  const [showPreview, setShowPreview] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Edit mode detection
  const resolvedParams = params ? use(params) : undefined
  const resolvedSearchParams = searchParams ? use(searchParams) : undefined
  const editId = resolvedParams?.id
  const caseId = resolvedSearchParams?.caseId
  const isEditMode = !!editId

  const [isTemplate, setIsTemplate] = useState(true)
  const selectedCase = caseId ? getProfileById(caseId) : null

  const [formData, setFormData] = useState({
    nameEn: "",
    nameAr: "",
  })

  const [questions, setQuestions] = useState<MCQuestion[]>([])
  const [pendingFiles, setPendingFiles] = useState<Map<string, File>>(new Map())
  const [uploadOpen, setUploadOpen] = useState(false)
  const [currentMediaQuestionId, setCurrentMediaQuestionId] = useState<
    string | null
  >(null)

  // Load existing data in edit mode
  useEffect(() => {
    if (isEditMode && editId && !isToolsLoading) {
      setIsLoading(true)
      const tool = getToolById(editId)
      if (tool && tool.config) {
        const config = tool.config as MultipleChoiceConfig
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
    const newQuestion: MCQuestion = {
      id: generateId(),
      text: "",
      answerType: "single_choice",
      options: [...DEFAULT_OPTIONS],
      required: false,
      order: questions.length,
    }
    setQuestions([...questions, newQuestion])
  }

  const updateQuestion = (id: string, updates: Partial<MCQuestion>) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, ...updates } : q)))
  }

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id))
  }

  const handleReorder = (reordered: MCQuestion[]) => {
    setQuestions(reordered)
  }

  const handleSubmit = async () => {
    if (!formData.nameEn || questions.length === 0) return
    setIsSubmitting(true)

    const toolTypes = await fetchToolTypes()
    const type = toolTypes.find((t) => t.key === "multiple_answer")?.id
    if (!type) {
      setIsSubmitting(false)
      return
    }

    const baseQuestions = questions.map((q, idx) => ({ ...q, order: idx }))
    const pendingEntries = Array.from(pendingFiles.entries())

    const baseConfig: MultipleChoiceConfig = {
      title: { en: formData.nameEn, ar: formData.nameAr },
      questions: baseQuestions,
      media: [],
    }

    let finalConfig: MultipleChoiceConfig

    // Helper: build finalConfig from uploaded URLs
    const buildFinalConfig = (uploadedUrls: string[]): MultipleChoiceConfig => {
      const finalQuestions = baseQuestions.map((q) => {
        const pendingIndex = pendingEntries.findIndex(([id]) => id === q.id)
        if (pendingIndex >= 0 && uploadedUrls[pendingIndex]) {
          return { ...q, mediaUrl: uploadedUrls[pendingIndex] }
        }
        return q
      })
      return {
        title: { en: formData.nameEn, ar: formData.nameAr },
        questions: finalQuestions,
        media: uploadedUrls,
      }
    }

    if (isEditMode && editId) {
      const mediaFormData = new FormData()
      for (const [, file] of pendingEntries) {
        mediaFormData.append("media", file)
      }
      mediaFormData.append("config", JSON.stringify(baseConfig))

      const record = await pb.collection("tools").update(editId, mediaFormData)
      const uploadedUrls = (record.media as string[]).map((filename) =>
        pb.files.getUrl(record, filename)
      )

      finalConfig = buildFinalConfig(uploadedUrls)

      await updateTool(editId, {
        name: { en: formData.nameEn, ar: formData.nameAr },
        config: finalConfig,
      })
      router.push(`/dashboard/admin/tools/multiple-choice/${editId}`)
      return
    }

    // Create mode: only 2 paths
    if (!isTemplate && caseId) {
      // Assignment: create in case_tools, upload media there
      const assignment = await caseToolsCollection.create({
        case: caseId,
        type: type,
        name_en: formData.nameEn,
        name_ar: formData.nameAr,
        is_not_template: true,
        config: baseConfig,
        status: "pending",
        is_visible_to_user: true,
        responses: {},
        media: [],
      })

      if (pendingEntries.length > 0) {
        const files = pendingEntries.map(([, file]) => file)
        const updated = await caseToolsCollection.updateWithFiles(
          assignment.id,
          {},
          files
        )
        const uploadedUrls = (updated.media as string[]).map((filename) =>
          pb.files.getUrl(updated, filename)
        )
        finalConfig = buildFinalConfig(uploadedUrls)
        await caseToolsCollection.update(assignment.id, { config: finalConfig })
      } else {
        finalConfig = baseConfig
      }

      router.push(`/dashboard/admin/cases/${caseId}`)
    } else {
      // Template (with or without case): create in tools, upload media there
      const mediaFormData = new FormData()
      mediaFormData.append("name_en", formData.nameEn)
      mediaFormData.append("name_ar", formData.nameAr)
      mediaFormData.append("type", type)
      mediaFormData.append("serviceType", "individual")
      mediaFormData.append("status", "active")
      mediaFormData.append("config", JSON.stringify(baseConfig))
      for (const [, file] of pendingEntries) {
        mediaFormData.append("media", file)
      }

      const record = await pb.collection("tools").create(mediaFormData)
      const uploadedUrls = (record.media as string[]).map((filename) =>
        pb.files.getUrl(record, filename)
      )

      finalConfig = buildFinalConfig(uploadedUrls)

      await updateTool(record.id, {
        name: { en: formData.nameEn, ar: formData.nameAr },
        config: finalConfig,
      })

      if (caseId) {
        await caseToolsCollection.create({
          case: caseId,
          type: type,
          name_en: formData.nameEn,
          name_ar: formData.nameAr,
          is_not_template: false,
          config: finalConfig,
          is_visible_to_user: true,
          status: "pending",
          responses: {},
          media: [],
        })
      }

      router.push(`/dashboard/admin/tools`)
    }
  }

  const getMediaIcon = (type?: MediaType) => {
    switch (type) {
      case "image":
        return Image
      case "video":
        return Video
      case "audio":
        return Music
      default:
        return Image
    }
  }

  const handleMediaUpload = (data: {
    file: File
    mediaType: MediaType
    responseType: ResponseType
  }) => {
    if (!currentMediaQuestionId) return
    updateQuestion(currentMediaQuestionId, {
      mediaType: data.mediaType,
      mediaUrl: "",
      responseType: data.responseType,
    })
    setPendingFiles((prev) =>
      new Map(prev).set(currentMediaQuestionId, data.file)
    )
    setCurrentMediaQuestionId(null)
  }

  const handleRemoveMedia = (questionId: string) => {
    updateQuestion(questionId, {
      mediaType: undefined,
      mediaUrl: undefined,
      responseType: undefined,
    })
    setPendingFiles((prev) => {
      const next = new Map(prev)
      next.delete(questionId)
      return next
    })
  }

  const renderQuestionItem = (question: MCQuestion, index: number) => {
    const showOptions =
      question.answerType === "single_choice" ||
      question.answerType === "multiple_choice"
    const showCorrect = showOptions
    const pendingFile = pendingFiles.get(question.id)
    const mediaPreviewSrc = pendingFile
      ? URL.createObjectURL(pendingFile)
      : question.mediaUrl

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
              onClick={() => {
                removeQuestion(question.id)
                setPendingFiles((prev) => {
                  const next = new Map(prev)
                  next.delete(question.id)
                  return next
                })
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>

        <Input
          placeholder="Question"
          value={question.text}
          onChange={(e) =>
            updateQuestion(question.id, { text: e.target.value })
          }
        />

        <Select
          value={question.answerType}
          onValueChange={(v) =>
            updateQuestion(question.id, { answerType: v as MCAnswerType })
          }
        >
          <SelectTrigger className="w-56">
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
            <Label className="text-xs">Options - check correct answer(s)</Label>
            {question.options.map((opt, optIdx) => (
              <div key={opt.value} className="flex items-center gap-2">
                <Checkbox
                  id={`correct-${question.id}-${optIdx}`}
                  checked={opt.isCorrect}
                  onCheckedChange={(checked) => {
                    const newOptions = question.options.map((o, i) =>
                      i === optIdx ? { ...o, isCorrect: !!checked } : o
                    )
                    updateQuestion(question.id, { options: newOptions })
                  }}
                />
                <Input
                  placeholder="Option"
                  value={opt.label}
                  onChange={(e) => {
                    const newOptions = question.options.map((o, i) =>
                      i === optIdx ? { ...o, label: e.target.value } : o
                    )
                    updateQuestion(question.id, { options: newOptions })
                  }}
                  className="flex-1"
                />
                {opt.isCorrect && (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
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
                    isCorrect: false,
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
              {isEditMode ? "Edit" : "Create"} Multiple Answer Builder
            </h1>
            <p className="text-muted-foreground">
              {isEditMode
                ? "Update quiz questions and answers"
                : "Build quiz with correct answer(s)"}
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
                  <Label>Name (EN)</Label>
                  <Input
                    value={formData.nameEn}
                    onChange={(e) =>
                      setFormData({ ...formData, nameEn: e.target.value })
                    }
                    placeholder="Quiz title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Name (AR)</Label>
                  <Input
                    value={formData.nameAr}
                    onChange={(e) =>
                      setFormData({ ...formData, nameAr: e.target.value })
                    }
                    placeholder="عنوان الاختبار"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {caseId && selectedCase && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {lang === "ar" ? "معلومات الحالة" : "Case Information"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">
                    {lang === "ar" ? "الحالة:" : "Case:"}
                  </span>
                  <span>{selectedCase.name}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {(caseId || !isEditMode) && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isTemplate"
                    checked={isTemplate}
                    onCheckedChange={(checked) =>
                      setIsTemplate(checked === true)
                    }
                  />
                  <label
                    htmlFor="isTemplate"
                    className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {lang === "ar"
                      ? "حفظ كقالب (متاح للاستخدام المستقبلي)"
                      : "Save as template (available for future use)"}
                  </label>
                </div>
              </CardContent>
            </Card>
          )}

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
                  No questions yet.
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
                  : "Create"}
            </Button>
          </div>
        </div>

        {showPreview && (
          <div className="sticky top-6 max-h-[calc(100vh-12rem)] overflow-auto rounded-lg border bg-card p-4">
            <p className="mb-4 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
              Live Preview
            </p>
            <MultipleChoicePreview
              config={{
                title: { en: formData.nameEn, ar: formData.nameAr },
                questions,
                media: [],
              }}
            />
          </div>
        )}
      </div>

      <MediaUpload
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUpload={handleMediaUpload}
      />
    </div>
  )
}
