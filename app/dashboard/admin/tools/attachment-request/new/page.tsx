"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAssignments } from "@/hooks/useAssignments"
import { useProfiles } from "@/hooks/useProfiles"
import { toolTypesCollection } from "@/lib/pb-collections"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { CaseSearchCombobox } from "@/components/case-search-combobox"
import { useLang } from "@/lib/lang-context"
import type { AttachmentRequestConfig, AttachmentFileType } from "@/types/tool"

const FILE_TYPES: {
  value: AttachmentFileType
  label: { en: string; ar: string }
  extensions: string
}[] = [
  { value: "image", label: { en: "Image", ar: "صورة" }, extensions: "(jpg, png, gif, webp)" },
  {
    value: "document",
    label: { en: "Document", ar: "مستند" },
    extensions: "(pdf, doc, docx, txt, xls, xlsx)",
  },
  { value: "video", label: { en: "Video", ar: "فيديو" }, extensions: "(mp4, mov, avi, mpeg)" },
  { value: "audio", label: { en: "Audio", ar: "صوت" }, extensions: "(mp3, wav, m4a)" },
  { value: "any", label: { en: "Any File", ar: "أي ملف" }, extensions: "(all types)" },
]

export default function AttachmentRequestBuilderPage({
  searchParams,
}: {
  searchParams: Promise<{ caseId?: string }>
}) {
  const router = useRouter()
  const { lang } = useLang()
  const { assignTool } = useAssignments()
  const { getProfileById } = useProfiles()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [attachmentTypeId, setAttachmentTypeId] = useState<string>("")
  const [typeError, setTypeError] = useState<string>("")

  const [selectedCaseId, setSelectedCaseId] = useState("")
  const [isInitializing, setIsInitializing] = useState(true)

  const [formData, setFormData] = useState({
    nameEn: "",
    nameAr: "",
    maxFiles: 1,
    maxFileSize: 10,
    required: true,
  })

  const [selectedTypes, setSelectedTypes] = useState<AttachmentFileType[]>([
    "image",
  ])

  // Fetch attachment_request type ID on mount
  useEffect(() => {
    const fetchAttachmentType = async () => {
      try {
        const attachmentType =
          await toolTypesCollection.getByName("attachment_request")
        setAttachmentTypeId(attachmentType.id)
        setTypeError("")
      } catch (error) {
        setTypeError(
          lang === "ar"
            ? 'نوع الأداة "attachment_request" غير موجود. يرجى الاتصال بالمسؤول.'
            : 'Tool type "attachment_request" not found. Please contact admin.'
        )
        console.error("Failed to fetch attachment_request type:", error)
      }
    }
    fetchAttachmentType()
  }, [])

  // Initialize from URL caseId
  useEffect(() => {
    const initFromUrl = async () => {
      try {
        const params = await searchParams
        const caseIdFromUrl = params?.caseId
        if (caseIdFromUrl) {
          handleCaseSelect(caseIdFromUrl)
        }
      } catch (e) {
        console.error("Failed to read searchParams:", e)
      } finally {
        setIsInitializing(false)
      }
    }
    initFromUrl()
  }, [])

  const handleCaseSelect = (caseId: string) => {
    setSelectedCaseId(caseId)
    if (caseId) {
      const caseProfile = getProfileById(caseId)
      if (caseProfile) {
        // Auto-populate request name with case name
        setFormData((prev) => ({
          ...prev,
          nameEn: `${caseProfile.name} - Attachment Request`,
          nameAr: `${caseProfile.name} - طلب مرفق`,
        }))
      }
    } else {
      // Reset name fields when case is cleared
      setFormData((prev) => ({
        ...prev,
        nameEn: "",
        nameAr: "",
      }))
    }
  }

  const toggleFileType = (type: AttachmentFileType) => {
    setSelectedTypes((prev) => {
      if (prev.includes(type)) {
        // Don't allow unchecking the last type
        if (prev.length === 1) return prev
        return prev.filter((t) => t !== type)
      }
      return [...prev, type]
    })
  }

  const handleSubmit = async () => {
    if (
      !selectedCaseId ||
      !formData.nameEn ||
      selectedTypes.length === 0 ||
      !attachmentTypeId
    )
      return
    setIsSubmitting(true)

    try {
      const config: AttachmentRequestConfig = {
        title: { en: formData.nameEn, ar: formData.nameAr },
        allowedTypes: selectedTypes,
        maxFiles: formData.maxFiles,
        maxFileSize: formData.maxFileSize,
        required: formData.required,
      }

      // Create case document directly in case_tools (no tool template)
      await assignTool({
        case: selectedCaseId,
        type: attachmentTypeId,
        name_en: formData.nameEn,
        name_ar: formData.nameAr,
        config,
        is_visible_to_user: true,
        status: "pending",
      })

      // Redirect to assignments page
      router.push(`/dashboard/admin/assignments`)
    } catch (error) {
      console.error(
        "Failed to create attachment request and assignment:",
        error
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    // Reset form instead of navigating back
    setSelectedCaseId("")
    setFormData({
      nameEn: "",
      nameAr: "",
      maxFiles: 1,
      maxFileSize: 10,
      required: true,
    })
    setSelectedTypes(["image"])
  }

  const isFormValid =
    selectedCaseId &&
    formData.nameEn &&
    selectedTypes.length > 0 &&
    attachmentTypeId

  if (typeError) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-destructive">{typeError}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">
            {lang === "ar"
              ? "إنشاء طلب إرفاق ملف"
              : "Create Request for Attachment"}
          </h1>
          <p className="text-muted-foreground">
            {lang === "ar"
              ? "إنشاء طلب مرفق لقضية محددة"
              : "Create an attachment request for a specific case"}
          </p>
        </div>
      </div>

      {typeError && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
          {typeError}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {lang === "ar" ? "اختر قضية *" : "Select Case *"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CaseSearchCombobox
                value={selectedCaseId}
                onChange={handleCaseSelect}
                placeholder={lang === "ar" ? "اختر قضية..." : "Select a case..."}
              />
              {!selectedCaseId && (
                <p className="mt-2 text-sm text-destructive">
                  {lang === "ar"
                    ? "يرجى اختيار قضية للمتابعة"
                    : "Please select a case to continue"}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                {lang === "ar" ? "اسم الطلب *" : "Request Name *"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{lang === "ar" ? "الاسم (إنجليزي)" : "Name (EN)"}</Label>
                  <Input
                    value={formData.nameEn}
                    onChange={(e) =>
                      setFormData({ ...formData, nameEn: e.target.value })
                    }
                    placeholder={
                      lang === "ar"
                        ? "مثال: تحميل التقرير الطبي"
                        : "e.g., Upload Medical Report"
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{lang === "ar" ? "الاسم (عربي)" : "Name (AR)"}</Label>
                  <Input
                    value={formData.nameAr}
                    onChange={(e) =>
                      setFormData({ ...formData, nameAr: e.target.value })
                    }
                    placeholder="مثال: تحميل التقرير الطبي"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                {lang === "ar" ? "متطلبات الملف" : "File Requirements"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>
                  {lang === "ar" ? "أنواع الملفات المسموحة" : "Allowed File Types"}
                </Label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {FILE_TYPES.map((type) => (
                    <div
                      key={type.value}
                      className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 hover:bg-muted/50"
                      onClick={() => toggleFileType(type.value)}
                    >
                      <Checkbox
                        checked={selectedTypes.includes(type.value)}
                        onCheckedChange={() => toggleFileType(type.value)}
                      />
                      <div className="flex-1">
                        <div className="font-medium">{type.label[lang]}</div>
                        <div className="text-xs text-muted-foreground">
                          {type.extensions}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>
                    {lang === "ar" ? "الحد الأقصى للملفات" : "Maximum Files"}
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={formData.maxFiles}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxFiles: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    {lang === "ar"
                      ? "عدد الملفات المسموح بها (1-20)"
                      : "Number of files allowed (1-20)"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>
                    {lang === "ar"
                      ? "الحد الأقصى لحجم الملف (ميجابايت)"
                      : "Maximum File Size (MB)"}
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={formData.maxFileSize}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxFileSize: parseInt(e.target.value) || 10,
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    {lang === "ar"
                      ? "الحد الأقصى لحجم الملف"
                      : "Size limit per file"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Checkbox
                  id="required"
                  checked={formData.required}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, required: !!checked })
                  }
                />
                <Label htmlFor="required" className="cursor-pointer">
                  {lang === "ar"
                    ? "إجباري - يجب على المستخدم رفع الملفات للإكمال"
                    : "Required - User must upload files to complete"}
                </Label>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={handleCancel}>
              {lang === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting
                ? lang === "ar"
                  ? "جارٍ الإنشاء..."
                  : "Creating..."
                : lang === "ar"
                  ? "إنشاء الطلب"
                  : "Create Request"}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{lang === "ar" ? "معاينة" : "Preview"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border bg-muted/30 p-4">
                <h3 className="font-semibold">
                  {formData.nameEn ||
                    (lang === "ar" ? "عنوان الطلب" : "Request Title")}
                </h3>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  {lang === "ar" ? "الأنواع المسموحة" : "Allowed Types"}
                </Label>
                <div className="flex flex-wrap gap-2">
                  {selectedTypes.map((type) => {
                    const typeInfo = FILE_TYPES.find((t) => t.value === type)
                    return (
                      <span
                        key={type}
                        className="rounded-full bg-primary/10 px-3 py-1 text-sm"
                      >
                        {typeInfo?.label[lang]}
                      </span>
                    )
                  })}
                </div>
              </div>

              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {lang === "ar" ? "الحد الأقصى للملفات:" : "Max Files:"}
                  </span>
                  <span>{formData.maxFiles}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {lang === "ar" ? "الحد الأقصى للحجم:" : "Max Size:"}
                  </span>
                  <span>{formData.maxFileSize} MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {lang === "ar" ? "إجباري:" : "Required:"}
                  </span>
                  <span>
                    {formData.required
                      ? lang === "ar"
                        ? "نعم"
                        : "Yes"
                      : lang === "ar"
                        ? "لا"
                        : "No"}
                  </span>
                </div>
              </div>

              <div className="rounded-lg border-2 border-dashed border-muted p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  {lang === "ar"
                    ? "ستظهر منطقة رفع الملفات هنا"
                    : "File upload area will appear here"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
