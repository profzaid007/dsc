"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useProfiles } from "@/hooks/useProfiles"
import { useAssignments } from "@/hooks/useAssignments"
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
import {
  ArrowLeft,
  FileText,
  ClipboardList,
  Calendar,
  FileBarChart,
  Layers,
  Settings,
  Plus,
  Paperclip,
} from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const toolTypeIcons: Record<string, typeof FileText> = {
  survey: FileText,
  multiple_answer: ClipboardList,
  media_question: Calendar,
  report: FileBarChart,
  plan: Layers,
  attachment_request: Paperclip,
}

const toolTypeLabels: Record<string, { en: string; ar: string }> = {
  survey: { en: "Survey", ar: "استبيان" },
  multiple_answer: { en: "Multiple Answer", ar: "إجابات متعددة" },
  media_question: { en: "Media Questions", ar: "أسئلة الوسائط" },
  report: { en: "Report", ar: "تقرير" },
  plan: { en: "Plan", ar: "خطة" },
  attachment_request: { en: "Request for Attachment", ar: "طلب مرفق" },
}

export default function ProfileToolsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { lang } = useLang()
  const { getProfileById } = useProfiles()
  const { getVisibleAssignments, updateAssignment } = useAssignments(id)
  const { toolTypes, fetchToolTypes } = useToolTypes()
  const [dialogOpen, setDialogOpen] = useState(false)

  const profile = getProfileById(id)
  const assignments = getVisibleAssignments(id)

  useEffect(() => {
    fetchToolTypes()
  }, [fetchToolTypes])

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="mb-4 text-xl font-medium">Profile not found</h2>
        <Link href="/dashboard/cases">
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
          <h1 className="text-2xl font-bold text-primary">Tools</h1>
          <p className="text-muted-foreground">
            Tools assigned to {profile.name}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Tool
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Tool to Case</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                  Template-Based Tools
                </h4>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() => {
                      setDialogOpen(false)
                      router.push(`/dashboard/admin/tools?assignTo=${id}`)
                    }}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Survey
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() => {
                      setDialogOpen(false)
                      router.push(`/dashboard/admin/tools?assignTo=${id}`)
                    }}
                  >
                    <ClipboardList className="mr-2 h-4 w-4" />
                    Multiple Answer
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() => {
                      setDialogOpen(false)
                      router.push(`/dashboard/admin/tools?assignTo=${id}`)
                    }}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Media Questions
                  </Button>
                </div>
              </div>
              <div>
                <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                  Case-Specific Tools
                </h4>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() => {
                      setDialogOpen(false)
                      router.push(
                        `/dashboard/admin/tools/plan/new?caseId=${id}`
                      )
                    }}
                  >
                    <Layers className="mr-2 h-4 w-4" />
                    Plan
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() => {
                      setDialogOpen(false)
                      router.push(
                        `/dashboard/admin/tools/report/new?caseId=${id}`
                      )
                    }}
                  >
                    <FileBarChart className="mr-2 h-4 w-4" />
                    Report
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() => {
                      setDialogOpen(false)
                      router.push(
                        `/dashboard/admin/tools/attachment-request/new?caseId=${id}`
                      )
                    }}
                  >
                    <Paperclip className="mr-2 h-4 w-4" />
                    Request for Attachment
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {assignments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ClipboardList className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-medium">No tools assigned</h3>
            <p className="text-center text-muted-foreground">
              Tools will appear here once assigned by an admin
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {assignments.map((assignment) => {
            // Look up tool type by ID
            const toolType = toolTypes.find((t) => t.id === assignment.type)
            const toolTypeName = toolType?.name || "custom"
            const Icon = toolTypeIcons[toolTypeName]
            const typeLabel = toolTypeLabels[toolTypeName]
            const displayName =
              lang === "ar"
                ? assignment.name_ar || assignment.name_en
                : assignment.name_en

            return (
              <Link
                key={assignment.id}
                href={`/dashboard/cases/${id}/tools/${assignment.id}`}
              >
                <Card className="h-full cursor-pointer transition-all hover:shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-primary" />
                        <CardTitle className="text-base">
                          {displayName}
                        </CardTitle>
                      </div>
                    </div>
                    <CardDescription>{typeLabel?.[lang]}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge
                      variant={
                        assignment.status === "completed"
                          ? "default"
                          : "secondary"
                      }
                      className="capitalize"
                    >
                      {assignment.status.replace("_", " ")}
                    </Badge>
                    {assignment.assigned_at && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        Assigned:{" "}
                        {new Date(assignment.assigned_at).toLocaleDateString()}
                      </p>
                    )}
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
