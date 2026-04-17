"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useProfiles } from "@/hooks/useProfiles"
import { useAssignments } from "@/hooks/useAssignments"
import { useTools } from "@/hooks/useTools"
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
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ArrowLeft,
  User,
  Calendar,
  Mail,
  Phone,
  ClipboardList,
  History,
  Eye,
  Pencil,
  Trash2,
  FileText,
  ClipboardList as MultiAnswerIcon,
  Image,
  FileBarChart,
  Layers,
  Paperclip,
  Plus,
} from "lucide-react"
import Link from "next/link"
import type { AssignmentStatus } from "@/types/assignment"
import type { Tool, ToolType, ToolConfig } from "@/types/tool"

const toolTypeIcons: Record<string, typeof FileText> = {
  survey: FileText,
  multiple_answer: MultiAnswerIcon,
  media_question: Image,
  report: FileBarChart,
  plan: Layers,
  attachment_request: Paperclip,
}

const toolTypeLabels: Record<string, string> = {
  survey: "Survey",
  multiple_answer: "Multiple Answer",
  media_question: "Media Questions",
  report: "Report",
  plan: "Plan",
  attachment_request: "Request for Attachment",
}

const statusColors: Record<AssignmentStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  assigned: "bg-blue-100 text-blue-800",
  in_progress: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
}

const statusLabels: Record<AssignmentStatus, string> = {
  pending: "Pending",
  assigned: "Assigned",
  in_progress: "In Progress",
  completed: "Completed",
}

export default function AdminCaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: caseId } = use(params)
  const router = useRouter()
  const { lang } = useLang()
  const { getProfileById } = useProfiles()
  const { assignments, assignTool, deleteAssignment } = useAssignments()
  const { tools } = useTools()
  const { toolTypes, fetchToolTypes } = useToolTypes()

  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedToolId, setSelectedToolId] = useState<string>("")
  const [isAssigning, setIsAssigning] = useState(false)
  const [assignTab, setAssignTab] = useState<"templates" | "caseSpecific">(
    "templates"
  )
  const [toolTypeFilter, setToolTypeFilter] = useState<string>("all")
  const [confirmToolType, setConfirmToolType] = useState<string | null>(null)

  const profile = getProfileById(caseId)
  const caseAssignments = assignments.filter((a) => a.case === caseId)

  useEffect(() => {
    fetchToolTypes()
  }, [fetchToolTypes])

  const handleAssignTool = async () => {
    if (!selectedToolId) return
    setIsAssigning(true)
    try {
      const tool = tools.find((t) => t.id === selectedToolId)
      if (tool) {
        const toolTypeObj = toolTypes.find((tt) => tt.id === tool.type)
        await assignTool({
          case: caseId,
          type: toolTypeObj?.id || tool.type,
          name_en: tool.name.en,
          name_ar: tool.name.ar,
          is_not_template: false,
          config: tool.config as ToolConfig,
          status: "pending",
          is_visible_to_user: true,
        })
        setShowAssignModal(false)
        setSelectedToolId("")
      }
    } finally {
      setIsAssigning(false)
    }
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="mb-4 text-xl font-medium">Case not found</h2>
        <Link href="/dashboard/admin/cases">
          <Button>Back to Cases</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-primary">{profile.name}</h1>
          <p className="text-muted-foreground">
            Created {new Date(profile.created).toLocaleDateString()}
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assigned">
            Assigned
            <Badge variant="secondary" className="ms-2">
              {caseAssignments.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="case-file">Case File</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Child Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date of Birth</span>
                  <span className="font-medium">{profile.date_of_birth}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gender</span>
                  <span className="font-medium capitalize">
                    {profile.gender}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Grade</span>
                  <span className="font-medium capitalize">
                    {profile.grade}
                  </span>
                </div>
                {profile.main_concerns.length > 0 && (
                  <div className="pt-2">
                    <span className="mb-2 block text-muted-foreground">
                      Main Concerns
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {profile.main_concerns.map((concern) => (
                        <Badge key={concern} variant="outline">
                          {concern}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {profile.notes && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{profile.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="assigned">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Assigned Tasks
                </CardTitle>
                <CardDescription>
                  Manage assignments for this case
                </CardDescription>
              </div>
              <Button onClick={() => setShowAssignModal(true)}>
                <Plus className="me-2 h-4 w-4" />
                Assign Tool
              </Button>
            </CardHeader>
            <CardContent>
              {caseAssignments.length === 0 ? (
                <div className="py-8 text-center">
                  <ClipboardList className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-medium">
                    No tasks assigned
                  </h3>
                  <p className="text-muted-foreground">
                    Click "Assign Tool" to add a task for this case
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Assignment</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Visible to User</TableHead>
                      <TableHead>Assigned Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {caseAssignments.map((assignment) => {
                      const toolType = toolTypes.find(
                        (t) => t.id === assignment.type
                      )
                      const toolTypeName = toolType?.name || "custom"
                      const Icon = toolTypeIcons[toolTypeName] || FileText

                      return (
                        <TableRow key={assignment.id}>
                          <TableCell className="font-medium">
                            {assignment.name_en || "Unnamed Assignment"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Icon className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs">
                                {toolTypeLabels[toolTypeName] || toolTypeName}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColors[assignment.status]}>
                              {statusLabels[assignment.status]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {assignment.is_visible_to_user ? "Yes" : "No"}
                          </TableCell>
                          <TableCell>
                            {new Date(
                              assignment.assigned_at || assignment.created
                            ).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Link
                                href={`/dashboard/admin/assignments/${assignment.id}`}
                              >
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteAssignment(assignment.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="case-file">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Case File
              </CardTitle>
              <CardDescription>
                History of all interactions between the case and the expert
              </CardDescription>
            </CardHeader>
            <CardContent>
              {caseAssignments.filter((a) => a.status === "completed")
                .length === 0 ? (
                <div className="py-8 text-center">
                  <History className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-medium">No history yet</h3>
                  <p className="text-muted-foreground">
                    Completed tasks will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {caseAssignments
                    .filter((a) => a.status === "completed")
                    .map((assignment) => (
                      <div
                        key={assignment.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div>
                          <p className="font-medium">
                            {lang === "ar"
                              ? assignment.name_ar || assignment.name_en
                              : assignment.name_en}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Completed{" "}
                            {assignment.updated &&
                              new Date(assignment.updated).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="default">Completed</Badge>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="mx-4 w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Assign Tool</CardTitle>
              <CardDescription>
                Select a template or create case-specific tool
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs
                value={assignTab}
                onValueChange={(v) =>
                  setAssignTab(v as "templates" | "caseSpecific")
                }
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="templates">Templates</TabsTrigger>
                  <TabsTrigger value="caseSpecific">Case-specific</TabsTrigger>
                </TabsList>

                <TabsContent value="templates" className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Filter by Type
                    </label>
                    <Select
                      value={toolTypeFilter}
                      onValueChange={setToolTypeFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="survey">Survey</SelectItem>
                        <SelectItem value="multiple_answer">
                          Multiple Answer
                        </SelectItem>
                        <SelectItem value="media_question">
                          Media Questions
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="max-h-[300px] space-y-2 overflow-y-auto">
                    {tools
                      .filter((tool) => {
                        if (toolTypeFilter === "all") return true
                        const toolTypeObj = toolTypes.find(
                          (t) => t.id === tool.type
                        )
                        return toolTypeObj?.name === toolTypeFilter
                      })
                      .map((tool) => {
                        const toolTypeObj = toolTypes.find(
                          (t) => t.id === tool.type
                        )
                        const typeName = toolTypeObj?.name || ""
                        const typeLabel = toolTypeLabels[typeName] || typeName
                        const Icon = toolTypeIcons[typeName] || FileText
                        const isSelected = selectedToolId === tool.id
                        return (
                          <div
                            key={tool.id}
                            onClick={() => setSelectedToolId(tool.id)}
                            className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                              isSelected
                                ? "border-primary bg-primary/5"
                                : "hover:border-muted-foreground hover:bg-muted/50"
                            }`}
                          >
                            <Icon className="h-5 w-5 shrink-0" />
                            <div className="flex-1">
                              <div className="font-medium">{tool.name.en}</div>
                              <div className="text-xs text-muted-foreground">
                                {typeLabel}
                              </div>
                            </div>
                            {isSelected && (
                              <div className="h-5 w-5 rounded-full bg-primary" />
                            )}
                          </div>
                        )
                      })}
                  </div>
                </TabsContent>

                <TabsContent value="caseSpecific">
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      {
                        type: "plan",
                        labelEn: "Plan",
                        labelAr: "خطة",
                        icon: Layers,
                      },
                      {
                        type: "report",
                        labelEn: "Report",
                        labelAr: "تقرير",
                        icon: FileBarChart,
                      },
                      {
                        type: "attachment_request",
                        labelEn: "Request Attachment",
                        labelAr: "طلب مرفق",
                        icon: Paperclip,
                      },
                    ].map((item) => (
                      <div
                        key={item.type}
                        onClick={() => setConfirmToolType(item.type)}
                        className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border p-6 text-center transition-colors hover:border-primary hover:bg-primary/5"
                      >
                        <item.icon className="h-8 w-8" />
                        <span className="font-medium">{item.labelEn}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardContent className="flex justify-end gap-2 pt-0">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAssignModal(false)
                  setSelectedToolId("")
                }}
              >
                Cancel
              </Button>
              {assignTab === "templates" && (
                <Button
                  onClick={handleAssignTool}
                  disabled={!selectedToolId || isAssigning}
                >
                  {isAssigning ? "Assigning..." : "Assign Tool"}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {confirmToolType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="mx-4 w-full max-w-sm">
            <CardHeader>
              <CardTitle>Confirm</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                {lang === "ar"
                  ? `إنشاء ${toolTypeLabels[confirmToolType]} جديد لهذه الحالة؟`
                  : `Create new ${toolTypeLabels[confirmToolType]} for this case?`}
              </p>
            </CardContent>
            <CardContent className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setConfirmToolType(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  router.push(
                    `/dashboard/admin/tools/${confirmToolType}/new?caseId=${caseId}`
                  )
                  setShowAssignModal(false)
                  setConfirmToolType(null)
                  setSelectedToolId("")
                }}
              >
                {lang === "ar" ? "إنشاء" : "Create"}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
