"use client"

import { useState } from "react"
import Link from "next/link"
import { useTools } from "@/hooks/useTools"
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
  Settings,
  Eye,
  EyeOff,
} from "lucide-react"

const toolTypeIcons: Record<ToolType, typeof FileText> = {
  survey: FileText,
  assessment: ClipboardList,
  meeting: Calendar,
  report: FileBarChart,
  plan: Layers,
  custom: Settings,
}

const toolTypeLabels: Record<ToolType, { en: string; ar: string }> = {
  survey: { en: "Survey", ar: "استبيان" },
  assessment: { en: "Assessment", ar: "تقييم" },
  meeting: { en: "Meeting", ar: "اجتماع" },
  report: { en: "Report", ar: "تقرير" },
  plan: { en: "Plan", ar: "خطة" },
  custom: { en: "Custom", ar: "مخصص" },
}

const statusColors: Record<Tool["status"], string> = {
  draft: "bg-yellow-100 text-yellow-800",
  active: "bg-green-100 text-green-800",
  archived: "bg-gray-100 text-gray-800",
}

export default function AdminToolsPage() {
  const { tools } = useTools()
  const [filterType, setFilterType] = useState<ToolType | "all">("all")
  const [filterStatus, setFilterStatus] = useState<Tool["status"] | "all">(
    "all"
  )

  const filteredTools = tools.filter((tool) => {
    if (filterType !== "all" && tool.type !== filterType) return false
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
            <SelectItem value="assessment">Assessment</SelectItem>
            <SelectItem value="meeting">Meeting</SelectItem>
            <SelectItem value="report">Report</SelectItem>
            <SelectItem value="plan">Plan</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
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
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredTools.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Settings className="mb-4 h-12 w-12 text-muted-foreground" />
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
            const Icon = toolTypeIcons[tool.type]
            return (
              <Link key={tool.id} href={`/dashboard/admin/tools/${tool.id}`}>
                <Card className="h-full cursor-pointer transition-all hover:shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-primary" />
                        <CardTitle className="text-base">
                          {tool.name.en}
                        </CardTitle>
                      </div>
                      {tool.isVisibleToUser ? (
                        <Eye className="h-4 w-4 text-green-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    <CardDescription>
                      {toolTypeLabels[tool.type].en}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge className={statusColors[tool.status]}>
                        {tool.status}
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
