"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useTools } from "@/hooks/useTools"
import { useToolTypes } from "@/hooks/useToolTypes"
import type { Tool, ToolType } from "@/types/tool"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  Plus,
  FileText,
  ClipboardList,
  Calendar,
  FileBarChart,
  Layers,
  Paperclip,
  Pencil,
  Trash2,
  Eye,
} from "lucide-react"

const toolTypeIcons: Record<ToolType, typeof FileText> = {
  survey: FileText,
  multiple_answer: ClipboardList,
  media_question: Calendar,
  report: FileBarChart,
  plan: Layers,
  attachment_request: Paperclip,
}

const toolTypeLabels: Record<ToolType, { en: string; ar: string }> = {
  survey: { en: "Survey", ar: "استبيان" },
  multiple_answer: { en: "Multiple Answer", ar: "إجابات متعددة" },
  media_question: { en: "Media Questions", ar: "أسئلة الوسائط" },
  report: { en: "Report", ar: "تقرير" },
  plan: { en: "Plan", ar: "خطة" },
  attachment_request: { en: "Request for Attachment", ar: "طلب مرفق" },
}

const statusColors: Record<Tool["status"], string> = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-yellow-100 text-yellow-800",
  archived: "bg-gray-100 text-gray-800",
}

const statusLabels: Record<Tool["status"], string> = {
  active: "Active",
  inactive: "Inactive",
  archived: "Archived",
}

export default function AdminToolsPage() {
  const { tools, deleteTool } = useTools()
  const router = useRouter()
  const { fetchToolTypes, getToolTypeById } = useToolTypes()
  const [filterType, setFilterType] = useState<ToolType | "all">("all")
  const [filterStatus, setFilterStatus] = useState<Tool["status"] | "all">(
    "all"
  )

  useEffect(() => {
    fetchToolTypes()
  }, [fetchToolTypes])

  const getTypeName = (typeId: string): ToolType | undefined => {
    const toolType = getToolTypeById(typeId)
    return toolType?.name as ToolType | undefined
  }

  const getTypeRoute = (typeName: ToolType): string => {
    switch (typeName) {
      case "survey":
        return "survey"
      case "multiple_answer":
        return "multiple-choice"
      case "media_question":
        return "media"
      case "report":
        return "report"
      case "plan":
        return "plan"
      case "attachment_request":
        return "attachment-request"
      default:
        return "survey"
    }
  }

  const filteredTools = tools.filter((tool) => {
    const typeName = getTypeName(tool.type)
    if (filterType !== "all" && typeName !== filterType) return false
    if (filterStatus !== "all" && tool.status !== filterStatus) return false
    return true
  })

  const handleDelete = async (toolId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (confirm("Are you sure you want to delete this tool?")) {
      await deleteTool(toolId)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Tools</h1>
          <p className="text-muted-foreground">Manage tool templates</p>
        </div>
        <Link href="/dashboard/admin/tools/new">
          <Button>
            <Plus className="me-2 h-4 w-4" />
            New Tool
          </Button>
        </Link>
      </div>

      <div className="flex gap-4">
        <Select
          value={filterType}
          onValueChange={(v) => setFilterType(v as ToolType | "all")}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="survey">Survey</SelectItem>
            <SelectItem value="multiple_answer">Multiple Answer</SelectItem>
            <SelectItem value="media_question">Media Questions</SelectItem>
            <SelectItem value="report">Report</SelectItem>
            <SelectItem value="plan">Plan</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filterStatus}
          onValueChange={(v) => setFilterStatus(v as Tool["status"] | "all")}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredTools.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-medium">No tools yet</h3>
            <p className="mb-4 text-center text-muted-foreground">
              Create your first tool to get started
            </p>
            <Link href="/dashboard/admin/tools/new">
              <Button>Create Tool</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Service Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTools.map((tool) => {
                const typeName = getTypeName(tool.type)
                const Icon = typeName
                  ? toolTypeIcons[typeName] || FileText
                  : FileText
                const typeLabel = typeName
                  ? toolTypeLabels[typeName]?.en
                  : "Unknown Type"
                const typeRoute = typeName ? getTypeRoute(typeName) : "survey"

                return (
                  <TableRow key={tool.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        {tool.name.en}
                      </div>
                    </TableCell>
                    <TableCell>{typeLabel}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[tool.status]}>
                        {statusLabels[tool.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize">
                      {tool.serviceType}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/dashboard/admin/tools/${typeRoute}/${tool.id}`}
                        >
                          <Button variant="ghost" size="icon-sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            router.push(
                              `/dashboard/admin/tools/${typeRoute}/edit/${tool.id}`
                            )
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={(e) => handleDelete(tool.id, e)}
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
        </Card>
      )}
    </div>
  )
}
