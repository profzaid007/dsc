"use client"

import { use, useState, useEffect, useMemo, useRef } from "react"
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
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Upload,
  X,
  FileText,
  Image,
  Video,
  Music,
  Play,
  Trash2,
  File,
} from "lucide-react"
import Link from "next/link"
import type {
  SurveyConfig,
  SurveyQuestion,
  MultipleChoiceConfig,
  MCQuestion,
  MediaConfig,
  MediaItem,
  AttachmentRequestConfig,
  AttachmentFileType,
} from "@/types/tool"
import { cn } from "@/lib/utils"
import pb from "@/lib/pb"

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
  const { assignments, updateAssignment, updateAssignmentWithFiles } =
    useAssignments(caseId)
  const { getToolTypeById, fetchToolTypes } = useToolTypes()

  const assignment = assignments.find((a) => a.id === assignmentId) // Find by toolId
  const profile = getProfileById(caseId) // Get profile by case ID
  const toolType = assignment ? getToolTypeById(assignment.type) : undefined
  const toolTypeName = toolType?.name || "unknown"

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

  // File upload state for media and attachment tools
  const [uploadedFiles, setUploadedFiles] = useState<
    Record<string, { file: File; preview?: string }>
  >({})
  const [existingFiles, setExistingFiles] = useState<Record<string, string[]>>(
    {}
  )
  const [filesToRemove, setFilesToRemove] = useState<string[]>([])

  useEffect(() => {
    fetchToolTypes()
  }, [fetchToolTypes])

  useEffect(() => {
    if (existingResponses && Object.keys(existingResponses).length > 0) {
      setAnswers(existingResponses)
    }
  }, [existingResponses])

  // Initialize existing files from assignment media
  useEffect(() => {
    if (assignment?.media && assignment.media.length > 0) {
      // Group files by response key from responses data
      const filesByKey: Record<string, string[]> = {}

      if (assignment.responses) {
        Object.entries(assignment.responses).forEach(([key, value]) => {
          if (typeof value === "string" && assignment.media?.includes(value)) {
            if (!filesByKey[key]) filesByKey[key] = []
            filesByKey[key].push(value)
          }
        })
      }

      // Also add files not yet mapped to any key (for attachment tool)
      const unmappedFiles = assignment.media.filter(
        (file) =>
          !Object.values(filesByKey).some((files) => files.includes(file))
      )
      if (unmappedFiles.length > 0) {
        filesByKey["_unmapped"] = unmappedFiles
      }

      setExistingFiles(filesByKey)
    }
  }, [assignment?.media, assignment?.responses])

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
        } else if (
          item.responseType === "video" ||
          item.responseType === "audio"
        ) {
          // Check if a file is uploaded for this media item
          const hasNewFile = uploadedFiles[item.id]
          const hasExistingFile =
            existingFiles[item.id] && existingFiles[item.id].length > 0
          if (!hasNewFile && !hasExistingFile) {
            missing.push(item.id)
          }
        }
      })
    }

    if (isAttachmentTool && attachmentConfig) {
      const totalFiles = Object.keys(uploadedFiles).length
      const totalExisting = existingFiles["_unmapped"]
        ? existingFiles["_unmapped"].filter((f) => !filesToRemove.includes(f))
            .length
        : 0

      if (attachmentConfig.required && totalFiles + totalExisting === 0) {
        missing.push("attachment")
      }
    }

    setErrors(missing)
    return missing.length === 0
  }

  const handleSubmit = async () => {
    if (!validateRequired()) return

    setIsSubmitting(true)
    try {
      // Build responses with file references for media/attachment tools
      const finalResponses: Record<string, unknown> = { ...answers }

      if (isMediaTool && mediaConfig) {
        mediaConfig.items.forEach((item) => {
          if (item.responseType === "text") {
            finalResponses[item.id] = mediaResponses[item.id] || ""
          } else if (uploadedFiles[item.id]) {
            // File will be uploaded, reference will be added after upload
            finalResponses[item.id] = uploadedFiles[item.id].file.name
          }
        })
      }

      if (isAttachmentTool) {
        // Add references for uploaded files
        Object.entries(uploadedFiles).forEach(([key, data]) => {
          finalResponses[key] = data.file.name
        })
      }

      // Upload files if any
      const filesToUpload = Object.values(uploadedFiles).map(
        (data) => data.file
      )

      if (filesToUpload.length > 0 || filesToRemove.length > 0) {
        await updateAssignmentWithFiles(
          assignmentId,
          {
            status: "completed",
            responses: finalResponses,
          },
          filesToUpload,
          filesToRemove.length > 0 ? filesToRemove : undefined
        )
      } else {
        await updateAssignment(assignmentId, {
          status: "completed",
          responses: finalResponses,
        })
      }

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

  // File handling helpers
  const handleFileSelect = (
    key: string,
    e: React.ChangeEvent<HTMLInputElement>,
    allowedTypes?: AttachmentFileType[]
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (allowedTypes && allowedTypes.length > 0) {
      const isValidType = validateFileType(file, allowedTypes)
      if (!isValidType) {
        alert(
          lang === "ar" ? "نوع الملف غير مسموح به" : "File type not allowed"
        )
        return
      }
    }

    // Validate file size (default 20MB)
    const maxSize = attachmentConfig?.maxFileSize || 20
    if (file.size > maxSize * 1024 * 1024) {
      alert(
        lang === "ar"
          ? `حجم الملف كبير جداً. الحد الأقصى ${maxSize} ميجابايت`
          : `File too large. Max size is ${maxSize}MB`
      )
      return
    }

    // Create preview for media files
    let preview: string | undefined
    if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
      preview = URL.createObjectURL(file)
    }

    setUploadedFiles((prev) => ({
      ...prev,
      [key]: { file, preview },
    }))
    setErrors((prev) => prev.filter((e) => e !== key))
  }

  const validateFileType = (
    file: File,
    allowedTypes: AttachmentFileType[]
  ): boolean => {
    if (allowedTypes.includes("any")) return true

    const typeMap: Record<AttachmentFileType, string[]> = {
      image: ["image/"],
      document: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument",
        "text/",
      ],
      video: ["video/"],
      audio: ["audio/"],
      any: [],
    }

    return allowedTypes.some((type) =>
      typeMap[type]?.some((prefix) => file.type.startsWith(prefix))
    )
  }

  const handleRemoveFile = (key: string) => {
    setUploadedFiles((prev) => {
      const newFiles = { ...prev }
      if (newFiles[key]?.preview) {
        URL.revokeObjectURL(newFiles[key].preview!)
      }
      delete newFiles[key]
      return newFiles
    })
  }

  const handleRemoveExistingFile = (filename: string) => {
    setFilesToRemove((prev) => [...prev, filename])
  }

  const getFileIcon = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase()
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext || ""))
      return <Image className="h-5 w-5" />
    if (["mp4", "webm", "mov", "avi"].includes(ext || ""))
      return <Video className="h-5 w-5" />
    if (["mp3", "wav", "ogg", "m4a"].includes(ext || ""))
      return <Music className="h-5 w-5" />
    return <FileText className="h-5 w-5" />
  }

  const getFileUrl = (filename: string) => {
    return pb.files.getUrl(
      { collectionId: "case_tools", id: assignmentId },
      filename
    )
  }

  const renderQuestion = (question: SurveyQuestion) => {
    const value = answers[question.id] as string | string[] | undefined
    const hasError = errors.includes(question.id)
    const isMultiple = surveyConfig?.answerType === "multiple_choice"
    const sortedOptions = [...(surveyConfig?.options || [])].sort(
      (a, b) => a.order - b.order
    )

    return (
      <div className="space-y-3">
        <Label className="text-base font-medium">
          {question.text}
          {question.required && (
            <span className="ms-1 text-destructive">*</span>
          )}
        </Label>
        {isMultiple ? (
          <div className="space-y-2">
            {sortedOptions.map((opt) => (
              <div key={opt.id} className="flex items-center gap-2">
                <Checkbox
                  id={`${question.id}-${opt.id}`}
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
                <Label htmlFor={`${question.id}-${opt.id}`}>{opt.label}</Label>
              </div>
            ))}
          </div>
        ) : (
          <RadioGroup
            value={(value as string) || ""}
            onValueChange={(v) => handleAnswer(question.id, v)}
          >
            {sortedOptions.map((opt) => (
              <div key={opt.id} className="flex items-center gap-2">
                <RadioGroupItem
                  value={opt.value}
                  id={`${question.id}-${opt.id}`}
                />
                <Label htmlFor={`${question.id}-${opt.id}`}>{opt.label}</Label>
              </div>
            ))}
          </RadioGroup>
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

  const renderMediaItem = (item: MediaItem) => {
    const hasNewUpload = uploadedFiles[item.id]
    const hasExistingFile =
      existingFiles[item.id] &&
      existingFiles[item.id].length > 0 &&
      !filesToRemove.includes(existingFiles[item.id][0])
    const hasError = errors.includes(item.id)

    return (
      <div key={item.id} className="space-y-3 rounded-lg border bg-card p-4">
        <Label className="text-base font-medium">
          {item.question}
        </Label>

        {/* Display existing media (question media) */}
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

        {/* Response section */}
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
            {hasError && (
              <div className="flex items-center gap-1 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {lang === "ar" ? "إجابة مطلوبة" : "This field is required"}
              </div>
            )}
          </div>
        )}

        {/* Video/Audio response upload */}
        {(item.responseType === "video" || item.responseType === "audio") && (
          <div className="space-y-3">
            <Label className="text-sm text-muted-foreground">
              {lang === "ar"
                ? item.responseType === "video"
                  ? "رفع فيديو الرد:"
                  : "رفع صوت الرد:"
                : item.responseType === "video"
                  ? "Upload video response:"
                  : "Upload audio response:"}
            </Label>

            {/* Show existing uploaded file */}
            {hasExistingFile && !hasNewUpload && (
              <div className="rounded-lg border bg-muted/30 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {item.responseType === "video" ? (
                      <Video className="h-5 w-5" />
                    ) : (
                      <Music className="h-5 w-5" />
                    )}
                    <span className="text-sm">
                      {existingFiles[item.id][0].split("_").pop()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        window.open(
                          getFileUrl(existingFiles[item.id][0]),
                          "_blank"
                        )
                      }
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleRemoveExistingFile(existingFiles[item.id][0])
                      }
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                {/* Preview player */}
                <div className="mt-2">
                  {item.responseType === "video" ? (
                    <video
                      src={getFileUrl(existingFiles[item.id][0])}
                      controls
                      className="w-full rounded"
                      style={{ maxHeight: "200px" }}
                    />
                  ) : (
                    <audio
                      src={getFileUrl(existingFiles[item.id][0])}
                      controls
                      className="w-full"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Show new file being uploaded */}
            {hasNewUpload && (
              <div className="rounded-lg border bg-muted/30 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {item.responseType === "video" ? (
                      <Video className="h-5 w-5" />
                    ) : (
                      <Music className="h-5 w-5" />
                    )}
                    <span className="text-sm">
                      {uploadedFiles[item.id].file.name}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFile(item.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {/* Preview player for new upload */}
                {uploadedFiles[item.id].preview && (
                  <div className="mt-2">
                    {item.responseType === "video" ? (
                      <video
                        src={uploadedFiles[item.id].preview}
                        controls
                        className="w-full rounded"
                        style={{ maxHeight: "200px" }}
                      />
                    ) : (
                      <audio
                        src={uploadedFiles[item.id].preview}
                        controls
                        className="w-full"
                      />
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Upload button */}
            {!hasExistingFile && !hasNewUpload && (
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept={item.responseType === "video" ? "video/*" : "audio/*"}
                  onChange={(e) => handleFileSelect(item.id, e)}
                  className="hidden"
                  id={`media-upload-${item.id}`}
                />
                <Button
                  variant="outline"
                  onClick={() =>
                    document.getElementById(`media-upload-${item.id}`)?.click()
                  }
                >
                  <Upload className="me-2 h-4 w-4" />
                  {lang === "ar" ? "اختيار ملف" : "Choose File"}
                </Button>
              </div>
            )}

            {hasError && (
              <div className="flex items-center gap-1 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {lang === "ar" ? "الرد مطلوب" : "Response is required"}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  const renderAttachment = () => {
    if (!attachmentConfig) return null

    const existingUnmapped = existingFiles["_unmapped"] || []
    const filteredExisting = existingUnmapped.filter(
      (f) => !filesToRemove.includes(f)
    )
    const newUploadKeys = Object.keys(uploadedFiles).filter((k) =>
      k.startsWith("attachment_")
    )
    const totalFiles = newUploadKeys.length + filteredExisting.length
    const hasError = errors.includes("attachment")

    return (
      <div className="space-y-4">
        <div className="rounded-lg border bg-card p-4">
          <h3 className="mb-2 text-lg font-semibold">
            {
              (attachmentConfig.title as unknown as { en: string; ar: string })[
                lang
              ]
            }
          </h3>
          <p className="text-sm text-muted-foreground">
            {lang === "ar"
              ? `الحد الأقصى: ${attachmentConfig.maxFiles} ملف(ات), ${attachmentConfig.maxFileSize}MB لكل ملف`
              : `Max files: ${attachmentConfig.maxFiles}, ${attachmentConfig.maxFileSize}MB each`}
          </p>
          <p className="text-sm text-muted-foreground">
            {lang === "ar" ? "أنواع الملفات المسموح بها: " : "Allowed types: "}
            {attachmentConfig.allowedTypes.join(", ")}
          </p>

          {/* Existing files */}
          {filteredExisting.length > 0 && (
            <div className="mt-4 space-y-2">
              <Label className="text-sm text-muted-foreground">
                {lang === "ar" ? "الملفات المرفقة:" : "Attached files:"}
              </Label>
              {filteredExisting.map((filename, idx) => (
                <div
                  key={`existing-${idx}`}
                  className="flex items-center justify-between rounded-lg border bg-muted/30 p-2"
                >
                  <div className="flex items-center gap-2">
                    {getFileIcon(filename)}
                    <span className="text-sm">{filename.split("_").pop()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        window.open(getFileUrl(filename), "_blank")
                      }
                    >
                      {lang === "ar" ? "عرض" : "View"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveExistingFile(filename)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* New uploads */}
          {newUploadKeys.length > 0 && (
            <div className="mt-4 space-y-2">
              <Label className="text-sm text-muted-foreground">
                {lang === "ar" ? "ملفات جديدة:" : "New files:"}
              </Label>
              {newUploadKeys.map((key) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-lg border bg-muted/30 p-2"
                >
                  <div className="flex items-center gap-2">
                    {getFileIcon(uploadedFiles[key].file.name)}
                    <span className="text-sm">
                      {uploadedFiles[key].file.name}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFile(key)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Upload button */}
          {totalFiles < attachmentConfig.maxFiles && (
            <div className="mt-4">
              <Input
                type="file"
                accept={getAcceptTypes(attachmentConfig.allowedTypes)}
                onChange={(e) => {
                  const newKey = `attachment_${Date.now()}`
                  handleFileSelect(newKey, e, attachmentConfig.allowedTypes)
                }}
                className="hidden"
                id="attachment-upload"
              />
              <Button
                variant="outline"
                onClick={() =>
                  document.getElementById("attachment-upload")?.click()
                }
              >
                <Upload className="me-2 h-4 w-4" />
                {lang === "ar" ? "إضافة ملف" : "Add File"}
              </Button>
            </div>
          )}

          {hasError && (
            <div className="mt-2 flex items-center gap-1 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {lang === "ar" ? "الملفات مطلوبة" : "Files are required"}
            </div>
          )}
        </div>
      </div>
    )
  }

  const getAcceptTypes = (allowedTypes: AttachmentFileType[]): string => {
    const typeMap: Record<AttachmentFileType, string> = {
      image: "image/*",
      document: ".pdf,.doc,.docx,.txt",
      video: "video/*",
      audio: "audio/*",
      any: "*/*",
    }
    return allowedTypes.map((t) => typeMap[t]).join(",")
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
              (() => {
                const sortedOptions = [...(surveyConfig?.options || [])].sort(
                  (a, b) => a.order - b.order
                )
                const isMultiple =
                  surveyConfig?.answerType === "multiple_choice"
                return (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-start text-xs tracking-wider text-muted-foreground uppercase">
                          <th className="min-w-[150px] pe-4 pb-2 text-start font-medium">
                            Questions
                          </th>
                          {sortedOptions.map((opt) => (
                            <th
                              key={opt.id}
                              className="px-2 pb-2 text-center font-medium whitespace-nowrap"
                            >
                              {opt.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {surveyConfig?.questions.map((question) => {
                          const value = answers[question.id] as
                            | string
                            | string[]
                            | undefined
                          return (
                            <tr
                              key={question.id}
                              className="text-muted-foreground"
                            >
                              <td className="py-3 pe-4 align-top font-medium">
                                {question.text}
                              </td>
                              {sortedOptions.map((opt) => (
                                <td
                                  key={opt.id}
                                  className="px-2 py-3 text-center"
                                >
                                  {isMultiple ? (
                                    ((value as string[]) || []).includes(
                                      opt.value
                                    ) ? (
                                      <div className="mx-auto h-4 w-4 rounded-full bg-primary" />
                                    ) : null
                                  ) : (value as string) === opt.value ? (
                                    <div className="mx-auto h-4 w-4 rounded-full bg-primary" />
                                  ) : null}
                                </td>
                              ))}
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )
              })()}

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
                    {
                      (item.question as unknown as { en: string; ar: string })[
                        lang
                      ]
                    }
                  </Label>
                  <div className="rounded-lg bg-muted/30 p-3">
                    {item.responseType === "text" ? (
                      <span className="font-medium">
                        {String(
                          answers[item.id] || mediaResponses[item.id] || "-"
                        )}
                      </span>
                    ) : (
                      <div>
                        {assignment.responses?.[item.id] ? (
                          <div className="flex items-center gap-2">
                            {item.responseType === "video" ? (
                              <Video className="h-5 w-5" />
                            ) : (
                              <Music className="h-5 w-5" />
                            )}
                            <span className="font-medium">
                              {(assignment.responses[item.id] as string)
                                .split("_")
                                .pop()}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                window.open(
                                  getFileUrl(
                                    assignment.responses[item.id] as string
                                  ),
                                  "_blank"
                                )
                              }
                            >
                              {lang === "ar" ? "تشغيل" : "Play"}
                            </Button>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

            {isAttachmentTool && (
              <div className="space-y-2">
                <Label className="text-base font-medium text-muted-foreground">
                  {(
                    attachmentConfig?.title as unknown as {
                      en: string
                      ar: string
                    }
                  )?.[lang] || (lang === "ar" ? "المرفقات" : "Attachments")}
                </Label>
                <div className="space-y-2">
                  {assignment.media && assignment.media.length > 0 ? (
                    assignment.media.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-lg bg-muted/30 p-3"
                      >
                        <div className="flex items-center gap-2">
                          {getFileIcon(file)}
                          <span className="font-medium">
                            {file.split("_").pop()}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            window.open(getFileUrl(file), "_blank")
                          }
                        >
                          {lang === "ar" ? "عرض" : "View"}
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">
                      {lang === "ar" ? "لا توجد ملفات" : "No files"}
                    </p>
                  )}
                </div>
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
              {/* <Button
                onClick={() => router.push(`/dashboard/cases/${profile.id}`)}
              > */}
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
            (() => {
              const sortedOptions = [...(surveyConfig?.options || [])].sort(
                (a, b) => a.order - b.order
              )
              const isMultiple = surveyConfig?.answerType === "multiple_choice"
              return (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-start text-xs tracking-wider text-muted-foreground uppercase">
                        <th className="min-w-[150px] pe-4 pb-2 text-start font-medium">
                          Questions
                        </th>
                        {sortedOptions.map((opt) => (
                          <th
                            key={opt.id}
                            className="px-2 pb-2 text-center font-medium whitespace-nowrap"
                          >
                            {opt.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {surveyConfig?.questions.map((question) => {
                        const value = answers[question.id] as
                          | string
                          | string[]
                          | undefined
                        const hasError = errors.includes(question.id)
                        return (
                          <tr key={question.id}>
                            <td className="py-3 pe-4 align-top">
                              <Label className="text-base font-medium">
                                {question.text}
                                {question.required && (
                                  <span className="ms-1 text-destructive">
                                    *
                                  </span>
                                )}
                              </Label>
                            </td>
                            {sortedOptions.map((opt) => (
                              <td
                                key={opt.id}
                                className="px-2 py-3 text-center"
                              >
                                {isMultiple ? (
                                  <Checkbox
                                    id={`${question.id}-${opt.id}`}
                                    checked={(
                                      (value as string[]) || []
                                    ).includes(opt.value)}
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
                                    className="mx-auto"
                                  />
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleAnswer(question.id, opt.value)
                                    }
                                    className={`mx-auto h-5 w-5 rounded-full border-2 transition-colors ${
                                      (value as string) === opt.value
                                        ? "border-primary bg-primary"
                                        : "border-muted-foreground hover:border-primary"
                                    }`}
                                  />
                                )}
                              </td>
                            ))}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  {errors.some((errId) =>
                    surveyConfig?.questions.find((q) => q.id === errId)
                  ) && (
                    <div className="mt-2 flex items-center gap-1 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      {lang === "ar"
                        ? "يرجى الإجابة على جميع الأسئلة المطلوبة"
                        : "Please answer all required questions"}
                    </div>
                  )}
                </div>
              )
            })()}

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
