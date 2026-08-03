"use client"

import { use, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useTools } from "@/hooks/useTools"
import { useAssignments } from "@/hooks/useAssignments"
import { useToolTypes } from "@/hooks/useToolTypes"
import { useLang } from "@/lib/lang-context"
import { toolTypesCollection } from "@/lib/pb-collections"
import { CaseSearchCombobox } from "@/components/case-search-combobox"
import { SurveyPreview } from "@/components/tool-renderers/SurveyPreview"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Trash2, UserPlus, FileText } from "lucide-react"
import Link from "next/link"
import type { SurveyConfig } from "@/types/tool"
import type { AssignmentStatus } from "@/types/assignment"
import { getToolTypeLabel, getToolTypeMeta } from "@/lib/tool-types"

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  assigned: "bg-blue-100 text-blue-800",
  in_progress: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  survey: "bg-blue-100 text-blue-800",
  multiple_answer: "bg-purple-100 text-purple-800",
  media_question: "bg-pink-100 text-pink-800",
  report: "bg-orange-100 text-orange-800",
  plan: "bg-teal-100 text-teal-800",
  attachment_request: "bg-indigo-100 text-indigo-800",
}

const statusLabels: Record<AssignmentStatus, { en: string; ar: string }> = {
  pending: { en: "Pending", ar: "قيد الانتظار" },
  assigned: { en: "Assigned", ar: "تم التعيين" },
  in_progress: { en: "In Progress", ar: "قيد التنفيذ" },
  completed: { en: "Completed", ar: "مكتمل" },
}

interface ToolViewPageProps {
  params: Promise<{ id: string }>
}

export default function SurveyViewPage({ params }: ToolViewPageProps) {
  const { id: toolId } = use(params)
  const router = useRouter()
  const { lang } = useLang()
  const { getToolById, deleteTool } = useTools()
  const { assignTool } = useAssignments()
  const { fetchToolTypes, getToolTypeByKey } = useToolTypes()
  const [selectedCaseId, setSelectedCaseId] = useState("")
  const [isAssigning, setIsAssigning] = useState(false)
  const hasFetched = useRef(false)

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true
    fetchToolTypes()
  }, [fetchToolTypes])

  const tool = getToolById(toolId)
  const config = tool?.config as SurveyConfig | undefined

  if (!tool || !config) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="mb-4 text-xl font-medium">
          {lang === "ar" ? "الأداة غير موجودة" : "Tool not found"}
        </h2>
        <Button onClick={() => router.push("/dashboard/admin/tools")}>
          {lang === "ar" ? "العودة إلى الأدوات" : "Back to Tools"}
        </Button>
      </div>
    )
  }

  const Icon = getToolTypeMeta("survey")?.icon || FileText
  const toolTypeLabel = getToolTypeLabel(getToolTypeByKey("survey"), lang)

  const handleAssign = async () => {
    if (!selectedCaseId || !tool) return
    setIsAssigning(true)
    try {
      // Get the tool_type ID for this tool
      const toolType = await toolTypesCollection.getByName("survey")

      await assignTool({
        case: selectedCaseId,
        type: toolType.id,
        name_en: tool.name.en,
        name_ar: tool.name.ar,
        is_not_template: false,
        config: tool.config,
        status: "pending",
        is_visible_to_user: true,
      })
      setSelectedCaseId("")
    } finally {
      setIsAssigning(false)
    }
  }

  const handleDelete = async () => {
    if (confirm(lang === "ar" ? "هل أنت متأكد من حذف هذه الأداة؟" : "Are you sure you want to delete this tool?")) {
      await deleteTool(toolId)
      router.push("/dashboard/admin/tools")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-primary">
              {tool.name[lang]}
            </h1>
            <p className="text-muted-foreground">
              {toolTypeLabel} • {tool.serviceType}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/admin/tools/survey/edit/${toolId}`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              {lang === "ar" ? "تعديل" : "Edit"}
            </Button>
          </Link>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            {lang === "ar" ? "حذف" : "Delete"}
          </Button>
        </div>
      </div>

      {/* Tool Details Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">
              {lang === "ar" ? "تفاصيل الأداة" : "Tool Details"}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                {lang === "ar" ? "الاسم (إنجليزي)" : "Name (EN)"}
              </span>
              <p>{tool.name.en}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                {lang === "ar" ? "الاسم (عربي)" : "Name (AR)"}
              </span>
              <p>{tool.name.ar}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                {lang === "ar" ? "النوع" : "Type"}
              </span>
              <div>
                <Badge className={statusColors["survey"]}>
                  {toolTypeLabel}
                </Badge>
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                {lang === "ar" ? "نوع الإجابة" : "Answer Type"}
              </span>
              <p className="capitalize">
                {config.answerType === "multiple_choice"
                  ? lang === "ar"
                    ? "اختيار من متعدد"
                    : "Multiple Choice"
                  : lang === "ar"
                    ? "اختيار واحد"
                    : "Single Choice"}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                {lang === "ar" ? "الخيارات" : "Options"}
              </span>
              <p>
                {config.options?.length || 0}{" "}
                {lang === "ar" ? "خيار" : "options"}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                {lang === "ar" ? "الأسئلة" : "Questions"}
              </span>
              <p>
                {config.questions?.length || 0}{" "}
                {lang === "ar" ? "سؤال" : "questions"}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                {lang === "ar" ? "الحالة" : "Status"}
              </span>
              <div>
                <Badge
                  variant={tool.status === "active" ? "default" : "secondary"}
                >
                  {tool.status === "active"
                    ? lang === "ar"
                      ? "نشط"
                      : "Active"
                    : tool.status === "inactive"
                      ? lang === "ar"
                        ? "غير نشط"
                        : "Inactive"
                      : lang === "ar"
                        ? "مؤرشف"
                        : "Archived"}
                </Badge>
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                {lang === "ar" ? "نوع الخدمة" : "Service Type"}
              </span>
              <p className="capitalize">{tool.serviceType}</p>
            </div>
          </div>
          {tool.description && (
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                {lang === "ar" ? "الوصف" : "Description"}
              </span>
              <p className="text-sm">{tool.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuration Preview */}
      <Card>
        <CardHeader>
          <CardTitle>
            {lang === "ar" ? "معاينة الإعدادات" : "Configuration Preview"}
          </CardTitle>
          <CardDescription>
            {lang === "ar"
              ? "معاينة كيف ستظهر هذه الأداة للمستخدمين"
              : "Preview of how this tool will appear to users"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SurveyPreview config={config} />
        </CardContent>
      </Card>

      {/* Quick Assign Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            {lang === "ar" ? "إسناد سريع" : "Quick Assign"}
          </CardTitle>
          <CardDescription>
            {lang === "ar"
              ? "إسناد هذه الأداة إلى قضية"
              : "Assign this tool to a case"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium">
                {lang === "ar" ? "اختر قضية" : "Select Case"}
              </label>
              <CaseSearchCombobox
                value={selectedCaseId}
                onChange={setSelectedCaseId}
                placeholder={
                  lang === "ar"
                    ? "ابحث واختر قضية..."
                    : "Search and select a case..."
                }
              />
            </div>
            <Button
              onClick={handleAssign}
              disabled={!selectedCaseId || isAssigning}
            >
              {isAssigning
                ? lang === "ar"
                  ? "جارٍ الإسناد..."
                  : "Assigning..."
                : lang === "ar"
                  ? "إسناد إلى قضية"
                  : "Assign to Case"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Note: Assignments are tracked in the global Assignments page */}
      <Card>
        <CardHeader>
          <CardTitle>{lang === "ar" ? "المهام" : "Assignments"}</CardTitle>
          <CardDescription>
            {lang === "ar" ? "عرض جميع المهام في صفحة " : "View all assignments in the "}
            <Link
              href="/dashboard/admin/assignments"
              className="text-primary hover:underline"
            >
              {lang === "ar" ? "المهام" : "Assignments page"}
            </Link>
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
