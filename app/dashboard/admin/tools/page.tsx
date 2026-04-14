"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useTools } from "@/hooks/useTools"
import { useToolTypes } from "@/hooks/useToolTypes"
import type { Tool, ToolType } from "@/types/tool"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
  Plus,
  FileText,
  ClipboardList,
  Calendar,
  FileBarChart,
  Layers,
  Paperclip,
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
  const { tools } = useTools()
  const { toolTypes, fetchToolTypes, getToolTypeById } = useToolTypes()
  const [filterType, setFilterType] = useState<ToolType | "all">("all")
  const [filterStatus, setFilterStatus] = useState<Tool["status"] | "all">(
    "all"
  )

  // Fetch tool types on mount
  useEffect(() => {
    fetchToolTypes()
  }, [fetchToolTypes])

  // Helper to get type name from ID
  const getTypeName = (typeId: string): ToolType | undefined => {
    const toolType = getToolTypeById(typeId)
    return toolType?.name as ToolType | undefined
  }

  // Helper to get route from type name
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
              <Link
                key={tool.id}
                href={`/dashboard/admin/tools/${typeRoute}/${tool.id}`}
              >
                <Card className="h-full cursor-pointer transition-all hover:shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-primary" />
                        <CardTitle className="text-base">
                          {tool.name.en}
                        </CardTitle>
                      </div>
                    </div>
                    <CardDescription>{typeLabel}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge className={statusColors[tool.status]}>
                        {statusLabels[tool.status]}
                      </Badge>
                      <span className="text-sm text-muted-foreground capitalize">
                        {tool.serviceType}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
