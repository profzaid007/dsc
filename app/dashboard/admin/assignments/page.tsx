"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAssignments } from "@/hooks/useAssignments"
import { useProfiles } from "@/hooks/useProfiles"
import { useToolTypes } from "@/hooks/useToolTypes"
import { useLang } from "@/lib/lang-context"
import { useAuth } from "@/hooks/useAuth"
import { formatDate } from "@/lib/format-date"
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
import { PageLoader } from "@/components/ui/page-loader"
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
import {
  ArrowLeft,
  Trash2,
  FileText,
  ClipboardList,
  Search,
  Eye,
} from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { SmartLink } from "@/components/smart-link"
import { CaseSearchCombobox } from "@/components/case-search-combobox"
import type { AssignmentStatus } from "@/types/assignment"
import { getToolTypeLabel, getToolTypeMeta } from "@/lib/tool-types"

const statusColors: Record<AssignmentStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  assigned: "bg-blue-100 text-blue-800",
  in_progress: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
}

const statusLabels: Record<AssignmentStatus, { en: string; ar: string }> = {
  pending: { en: "Pending", ar: "قيد الانتظار" },
  assigned: { en: "Assigned", ar: "تم التعيين" },
  in_progress: { en: "In Progress", ar: "قيد التنفيذ" },
  completed: { en: "Completed", ar: "مكتمل" },
}

export default function AssignmentsPage() {
  const router = useRouter()
  const { lang } = useLang()
  const {
    assignments,
    deleteAssignment,
    updateAssignment,
    isLoading: isAssignmentsLoading,
  } = useAssignments()
  const { profiles, isLoading: isProfilesLoading } = useProfiles()
  const {
    toolTypes,
    isLoading: isToolTypesLoading,
    fetchToolTypes,
    getToolTypeById,
  } = useToolTypes()
  const hasFetched = useRef(false)

  const { currentUser } = useAuth()
  const isExpert = currentUser?.role === "expert"

  const [searchQuery, setSearchQuery] = useState("")
  const [filterCase, setFilterCase] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<AssignmentStatus | "all">(
    "all"
  )

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true
    fetchToolTypes()
  }, [fetchToolTypes])

  const getCaseName = (caseId: string) => {
    const profile = profiles.find((p) => p.id === caseId)
    return profile?.name || (lang === "ar" ? "حالة غير معروفة" : "Unknown Case")
  }

  const getToolTypeName = (typeId: string) => {
    const toolType = getToolTypeById(typeId)
    return toolType?.key || "Unknown"
  }

  const expertCaseIds = isExpert ? profiles.map((p) => p.id) : []

  const filteredAssignments = assignments.filter((assignment) => {
    // Filter by expert's assigned cases
    if (isExpert && !expertCaseIds.includes(assignment.case)) return false

    // Filter by search query
    if (searchQuery) {
      const caseName = getCaseName(assignment.case).toLowerCase()
      const assignmentName = (assignment.name_en || "").toLowerCase()
      if (
        !caseName.includes(searchQuery.toLowerCase()) &&
        !assignmentName.includes(searchQuery.toLowerCase())
      ) {
        return false
      }
    }

    // Filter by case
    if (filterCase && assignment.case !== filterCase) {
      return false
    }

    // Filter by type
    if (filterType !== "all" && assignment.type !== filterType) {
      return false
    }

    // Filter by status
    if (filterStatus !== "all" && assignment.status !== filterStatus) {
      return false
    }

    return true
  })

  // Get unique tool types for filter dropdown
  const uniqueToolTypes = Array.from(
    new Set(assignments.map((a) => a.type))
  ).filter(Boolean)

  const isLoading =
    isAssignmentsLoading || isProfilesLoading || isToolTypesLoading

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary">
                {lang === "ar" ? "التعيينات" : "Assignments"}
              </h1>
              <p className="text-muted-foreground">
                {lang === "ar"
                  ? "إدارة تعيينات الأدوات للحالات"
                  : "Manage tool assignments to cases"}
              </p>
            </div>
          </div>
        </div>
        <SkeletonTable rows={6} />
      </div>
    )
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
              {lang === "ar" ? "التعيينات" : "Assignments"}
            </h1>
            <p className="text-muted-foreground">
              {lang === "ar"
                ? "إدارة تعيينات الأدوات للحالات"
                : "Manage tool assignments to cases"}
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
                placeholder={
                  lang === "ar"
                    ? "ابحث باسم التعيين..."
                    : "Search by assignment name..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <CaseSearchCombobox
              value={filterCase}
              onChange={setFilterCase}
              placeholder={lang === "ar" ? "تصفية حسب الحالة..." : "Filter by case..."}
              className="w-[250px]"
            />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue
                  placeholder={lang === "ar" ? "تصفية حسب النوع" : "Filter by Type"}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {lang === "ar" ? "جميع الأنواع" : "All Types"}
                </SelectItem>
                {uniqueToolTypes.map((typeId) => {
                  const toolType = getToolTypeById(typeId)
                  return (
                    <SelectItem key={typeId} value={typeId}>
                      {getToolTypeLabel(toolType, lang)}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            <Select
              value={filterStatus}
              onValueChange={(v) =>
                setFilterStatus(v as AssignmentStatus | "all")
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue
                  placeholder={lang === "ar" ? "تصفية حسب الحالة" : "Filter by Status"}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {lang === "ar" ? "جميع الحالات" : "All Status"}
                </SelectItem>
                <SelectItem value="pending">
                  {lang === "ar" ? "قيد الانتظار" : "Pending"}
                </SelectItem>
                <SelectItem value="assigned">
                  {lang === "ar" ? "تم التعيين" : "Assigned"}
                </SelectItem>
                <SelectItem value="in_progress">
                  {lang === "ar" ? "قيد التنفيذ" : "In Progress"}
                </SelectItem>
                <SelectItem value="completed">
                  {lang === "ar" ? "مكتمل" : "Completed"}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Assignments Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {lang === "ar" ? "جميع التعيينات" : "All Assignments"}
          </CardTitle>
          <CardDescription>
            {lang === "ar"
              ? `تم العثور على ${filteredAssignments.length} تعيين`
              : `${filteredAssignments.length} assignment(s) found`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAssignments.length === 0 ? (
            <div className="py-12 text-center">
              <ClipboardList className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-medium">
                {lang === "ar" ? "لا توجد تعيينات" : "No assignments found"}
              </h3>
              <p className="text-muted-foreground">
                {assignments.length === 0
                  ? lang === "ar"
                    ? "لم يتم تعيين أي أدوات للحالات بعد. انتقل إلى إحدى الأدوات واستخدم التعيين السريع."
                    : "No tools have been assigned to cases yet. Go to a tool and use Quick Assign."
                  : lang === "ar"
                    ? "لا توجد تعيينات تطابق عوامل التصفية."
                    : "No assignments match your filters."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{lang === "ar" ? "الحالة" : "Case"}</TableHead>
                  <TableHead>
                    {lang === "ar" ? "التعيين" : "Assignment"}
                  </TableHead>
                  <TableHead>{lang === "ar" ? "النوع" : "Type"}</TableHead>
                  <TableHead>{lang === "ar" ? "الحالة" : "Status"}</TableHead>
                  <TableHead>
                    {lang === "ar" ? "مرئي للمستخدم" : "Visible to User"}
                  </TableHead>
                  <TableHead>
                    {lang === "ar" ? "تاريخ التعيين" : "Assigned Date"}
                  </TableHead>
                  <TableHead className="text-right">
                    {lang === "ar" ? "الإجراءات" : "Actions"}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssignments.map((assignment) => {
                  const toolType = getToolTypeById(assignment.type)
                  const typeName = getToolTypeName(assignment.type)
                  const Icon = getToolTypeMeta(typeName)?.icon || FileText
                  return (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">
                        <SmartLink
                          href={`/dashboard/cases/${assignment.case}`}
                          className="hover:text-primary hover:underline"
                        >
                          {getCaseName(assignment.case)}
                        </SmartLink>
                      </TableCell>
                      <TableCell>
                        <SmartLink
                          href={`/dashboard/admin/assignments/${assignment.id}`}
                          className="hover:text-primary hover:underline"
                        >
                          {assignment.name_en ||
                            (lang === "ar"
                              ? "تعيين بدون اسم"
                              : "Unnamed Assignment")}
                        </SmartLink>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Icon className="h-3 w-3" />
                          <span className="text-xs">
                            {getToolTypeLabel(toolType, lang)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[assignment.status]}>
                          {statusLabels[assignment.status][lang]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={assignment.is_visible_to_user}
                          onCheckedChange={(checked) =>
                            updateAssignment(assignment.id, {
                              is_visible_to_user: checked,
                            })
                          }
                        />
                      </TableCell>
                      <TableCell>
                        {formatDate(assignment.assigned_at || assignment.created)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <SmartLink
                            href={`/dashboard/admin/assignments/${assignment.id}`}
                          >
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </SmartLink>
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
    </div>
  )
}
