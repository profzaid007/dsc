"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useTools } from "@/hooks/useTools"
import { useToolTypes } from "@/hooks/useToolTypes"
import { useLang } from "@/lib/lang-context"
import type { Tool, ToolType } from "@/types/tool"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SkeletonTable } from "@/components/ui/skeleton"
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
import { Plus, FileText, Pencil, Trash2, Eye } from "lucide-react"
import {
  getToolTypeLabel,
  getToolTypeMeta,
  toolTypeOrder,
} from "@/lib/tool-types"

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
  const router = useRouter()
  const { lang } = useLang()
  const { tools, deleteTool, isLoading: isToolsLoading } = useTools()
  const {
    toolTypes,
    fetchToolTypes,
    getToolTypeById,
    isLoading: isToolTypesLoading,
  } = useToolTypes()
  const [filterType, setFilterType] = useState<ToolType | "all">("all")
  const [filterStatus, setFilterStatus] = useState<Tool["status"] | "all">(
    "all"
  )
  const hasFetched = useRef(false)

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true
    fetchToolTypes()
  }, [fetchToolTypes])

  const getTypeName = (typeId: string): ToolType | undefined => {
    const toolType = getToolTypeById(typeId)
    return toolType?.key as ToolType | undefined
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

  const isLoading = isToolsLoading || isToolTypesLoading

  if (isLoading) {
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
        <SkeletonTable rows={5} />
      </div>
    )
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
            {toolTypeOrder
              .flatMap((key) => {
                const toolType = toolTypes.find((item) => item.key === key)
                return toolType ? [toolType] : []
              })
              .map((toolType) => (
                <SelectItem key={toolType.id} value={toolType.key}>
                  {getToolTypeLabel(toolType, lang)}
                </SelectItem>
              ))}
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
                const typeRecord = getToolTypeById(tool.type)
                const Icon = getToolTypeMeta(typeName)?.icon || FileText
                const typeLabel = getToolTypeLabel(typeRecord, lang)
                const typeRoute = getToolTypeMeta(typeName)?.route || "survey"

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
