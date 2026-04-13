"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAssignments } from "@/hooks/useAssignments"
import { useProfiles } from "@/hooks/useProfiles"
import { useTools } from "@/hooks/useTools"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
  Trash2,
  FileText,
  ClipboardList,
  Image,
  FileBarChart,
  Layers,
  Search,
} from "lucide-react"
import Link from "next/link"
import type { ToolType } from "@/types/tool"
import type { AssignmentStatus } from "@/types/assignment"

const toolTypeIcons: Record<ToolType, typeof FileText> = {
  survey: FileText,
  multiple_answer: ClipboardList,
  media_question: Image,
  report: FileBarChart,
  plan: Layers,
}

const toolTypeLabels: Record<ToolType, string> = {
  survey: "Survey",
  multiple_answer: "Multiple Answer",
  media_question: "Media Questions",
  report: "Report",
  plan: "Plan",
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

export default function AssignmentsPage() {
  const router = useRouter()
  const { assignments, deleteAssignment, isLoading } = useAssignments()
  const { profiles } = useProfiles()
  const { tools } = useTools()

  const [searchQuery, setSearchQuery] = useState("")
  const [filterTool, setFilterTool] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<AssignmentStatus | "all">(
    "all"
  )

  const getCaseName = (caseId: string) => {
    const profile = profiles.find((p) => p.id === caseId)
    return profile?.name || "Unknown Case"
  }

  const getTool = (toolId: string) => {
    return tools.find((t) => t.id === toolId)
  }

  const filteredAssignments = assignments.filter((assignment) => {
    // Filter by search query
    if (searchQuery) {
      const caseName = getCaseName(assignment.case).toLowerCase()
      const tool = getTool(assignment.tool)
      const toolName = tool?.name?.en?.toLowerCase() || ""
      if (
        !caseName.includes(searchQuery.toLowerCase()) &&
        !toolName.includes(searchQuery.toLowerCase())
      ) {
        return false
      }
    }

    // Filter by tool
    if (filterTool !== "all" && assignment.tool !== filterTool) {
      return false
    }

    // Filter by status
    if (filterStatus !== "all" && assignment.status !== filterStatus) {
      return false
    }

    return true
  })

  const getToolViewRoute = (toolId: string) => {
    const tool = getTool(toolId)
    if (!tool) return `/dashboard/admin/tools`
    const typeRoute =
      tool.type === "survey"
        ? "survey"
        : tool.type === "multiple_answer"
          ? "multiple-choice"
          : tool.type === "media_question"
            ? "media"
            : tool.type === "report"
              ? "report"
              : "plan"
    return `/dashboard/admin/tools/${typeRoute}/${toolId}`
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
            <h1 className="text-2xl font-bold text-primary">Assignments</h1>
            <p className="text-muted-foreground">
              Manage tool assignments to cases
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by case or tool name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterTool} onValueChange={setFilterTool}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by Tool" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tools</SelectItem>
                {tools.map((tool) => (
                  <SelectItem key={tool.id} value={tool.id}>
                    {tool.name.en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filterStatus}
              onValueChange={(v) =>
                setFilterStatus(v as AssignmentStatus | "all")
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Assignments Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Assignments</CardTitle>
          <CardDescription>
            {filteredAssignments.length} assignment(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="py-8 text-center text-muted-foreground">Loading...</p>
          ) : filteredAssignments.length === 0 ? (
            <div className="py-12 text-center">
              <ClipboardList className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-medium">No assignments found</h3>
              <p className="text-muted-foreground">
                {assignments.length === 0
                  ? "No tools have been assigned to cases yet. Go to a tool and use Quick Assign."
                  : "No assignments match your filters."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case</TableHead>
                  <TableHead>Tool</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssignments.map((assignment) => {
                  const tool = getTool(assignment.tool)
                  const Icon = tool ? toolTypeIcons[tool.type] : FileText
                  return (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/dashboard/cases/${assignment.case}`}
                          className="hover:text-primary hover:underline"
                        >
                          {getCaseName(assignment.case)}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={getToolViewRoute(assignment.tool)}
                          className="hover:text-primary hover:underline"
                        >
                          {tool?.name?.en || "Unknown Tool"}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {tool && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Icon className="h-3 w-3" />
                            <span className="text-xs">
                              {toolTypeLabels[tool.type]}
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[assignment.status]}>
                          {statusLabels[assignment.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(
                          assignment.assigned_at || assignment.created
                        ).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteAssignment(assignment.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
