"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import { useTools } from "@/hooks/useTools"
import { useAssignments } from "@/hooks/useAssignments"
import { useLang } from "@/lib/lang-context"
import { toolTypesCollection } from "@/lib/pb-collections"
import { CaseSearchCombobox } from "@/components/case-search-combobox"
import { MultipleChoicePreview } from "@/components/tool-renderers/MultipleChoicePreview"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Edit,
  Trash2,
  UserPlus,
  FileText,
  ClipboardList,
  Image,
  FileBarChart,
  Layers,
  Paperclip,
} from "lucide-react"
import Link from "next/link"
import type { ToolType, MultipleChoiceConfig } from "@/types/tool"
import type { AssignmentStatus } from "@/types/assignment"

const toolTypeIcons: Record<ToolType, typeof FileText> = {
  survey: FileText,
  multiple_answer: ClipboardList,
  media_question: Image,
  report: FileBarChart,
  plan: Layers,
  attachment_request: Paperclip,
}

const toolTypeLabels: Record<ToolType, string> = {
  survey: "Survey",
  multiple_answer: "Multiple Answer",
  media_question: "Media Questions",
  report: "Report",
  plan: "Plan",
  attachment_request: "Request for Attachment",
}

const statusColors: Record<AssignmentStatus | ToolType, string> = {
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

const statusLabels: Record<AssignmentStatus, string> = {
  pending: "Pending",
  assigned: "Assigned",
  in_progress: "In Progress",
  completed: "Completed",
}

interface ToolViewPageProps {
  params: Promise<{ id: string }>
}

export default function MultipleChoiceViewPage({ params }: ToolViewPageProps) {
  const { id: toolId } = use(params)
  const router = useRouter()
  const { lang } = useLang()
  const { getToolById, deleteTool } = useTools()
  const { assignTool } = useAssignments()
  const [selectedCaseId, setSelectedCaseId] = useState("")
  const [isAssigning, setIsAssigning] = useState(false)

  const tool = getToolById(toolId)
  const config = tool?.config as MultipleChoiceConfig | undefined

  if (!tool || !config) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="mb-4 text-xl font-medium">Tool not found</h2>
        <Button onClick={() => router.push("/dashboard/admin/tools")}>
          Back to Tools
        </Button>
      </div>
    )
  }

  const Icon = toolTypeIcons["multiple_answer"]

  const handleAssign = async () => {
    if (!selectedCaseId || !tool) return
    setIsAssigning(true)
    try {
      // Get the tool_type ID for this tool
      const toolType = await toolTypesCollection.getByName("multiple_answer")

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
    if (confirm("Are you sure you want to delete this tool?")) {
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
              {toolTypeLabels["multiple_answer"]} • {tool.serviceType}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/admin/tools/multiple-choice/edit/${toolId}`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Tool Details Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Tool Details</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Name (EN)
              </span>
              <p>{tool.name.en}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Name (AR)
              </span>
              <p>{tool.name.ar}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Type
              </span>
              <div>
                <Badge className={statusColors["multiple_answer"]}>
                  {toolTypeLabels["multiple_answer"]}
                </Badge>
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Status
              </span>
              <div>
                <Badge
                  variant={tool.status === "active" ? "default" : "secondary"}
                >
                  {tool.status}
                </Badge>
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Service Type
              </span>
              <p className="capitalize">{tool.serviceType}</p>
            </div>
          </div>
          {tool.description && (
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Description
              </span>
              <p className="text-sm">{tool.description[lang]}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuration Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration Preview</CardTitle>
          <CardDescription>
            Preview of how this tool will appear to users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MultipleChoicePreview config={config} />
        </CardContent>
      </Card>

      {/* Quick Assign Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Quick Assign
          </CardTitle>
          <CardDescription>Assign this tool to a case</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium">
                Select Case
              </label>
              <CaseSearchCombobox
                value={selectedCaseId}
                onChange={setSelectedCaseId}
                placeholder="Search and select a case..."
              />
            </div>
            <Button
              onClick={handleAssign}
              disabled={!selectedCaseId || isAssigning}
            >
              {isAssigning ? "Assigning..." : "Assign to Case"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Note: Assignments are tracked in the global Assignments page */}
      <Card>
        <CardHeader>
          <CardTitle>Assignments</CardTitle>
          <CardDescription>
            View all assignments in the{" "}
            <Link
              href="/dashboard/admin/assignments"
              className="text-primary hover:underline"
            >
              Assignments page
            </Link>
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
