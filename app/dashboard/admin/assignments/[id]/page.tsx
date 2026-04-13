"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAssignments } from "@/hooks/useAssignments"
import { useProfiles } from "@/hooks/useProfiles"
import { toolTypesCollection } from "@/lib/pb-collections"
import { useLang } from "@/lib/lang-context"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SurveyPreview } from "@/components/tool-renderers/SurveyPreview"
import { MultipleChoicePreview } from "@/components/tool-renderers/MultipleChoicePreview"
import { MediaPreview } from "@/components/tool-renderers/MediaPreview"
import {
  ArrowLeft,
  FileText,
  ClipboardList,
  Image,
  FileBarChart,
  Layers,
  Paperclip,
} from "lucide-react"
import Link from "next/link"
import type {
  SurveyConfig,
  MultipleChoiceConfig,
  MediaConfig,
} from "@/types/tool"
import type { AssignmentStatus } from "@/types/assignment"

// Tool type name to icon mapping
const toolTypeIcons: Record<string, typeof FileText> = {
  survey: FileText,
  multiple_answer: ClipboardList,
  media_question: Image,
  report: FileBarChart,
  plan: Layers,
  attachment_request: Paperclip,
}

// Tool type name to label mapping
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

interface AssignmentDetailPageProps {
  params: Promise<{ id: string }>
}

export default function AssignmentDetailPage({
  params,
}: AssignmentDetailPageProps) {
  const { id: assignmentId } = use(params)
  const router = useRouter()
  const { lang } = useLang()
  const { assignments } = useAssignments()
  const { profiles } = useProfiles()

  const [toolTypes, setToolTypes] = useState<Map<string, string>>(new Map()) // id -> name
  const [toolTypesLoaded, setToolTypesLoaded] = useState(false)

  // Fetch tool types on mount
  useEffect(() => {
    const fetchToolTypes = async () => {
      try {
        const types = await toolTypesCollection.getAll()
        const typeMap = new Map<string, string>()
        types.forEach((type) => {
          typeMap.set(type.id, type.name)
        })
        setToolTypes(typeMap)
        setToolTypesLoaded(true)
      } catch (error) {
        console.error("Failed to fetch tool types:", error)
      }
    }
    fetchToolTypes()
  }, [])

  const assignment = assignments.find((a) => a.id === assignmentId)
  const profile = assignment
    ? profiles.find((p) => p.id === assignment.case)
    : undefined

  // Get type name from tool type ID
  const typeName = assignment?.type
    ? toolTypes.get(assignment.type) || "Unknown"
    : "Unknown"

  // Use stored config from assignment
  const config = assignment?.config

  if (!toolTypesLoaded) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!assignment || !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="mb-4 text-xl font-medium">Assignment not found</h2>
        <Button onClick={() => router.push("/dashboard/admin/assignments")}>
          Back to Assignments
        </Button>
      </div>
    )
  }

  const Icon = toolTypeIcons[typeName] || FileText

  const renderToolPreview = () => {
    if (!config) return null

    switch (typeName) {
      case "survey":
        return <SurveyPreview config={config as SurveyConfig} />
      case "multiple_answer":
        return <MultipleChoicePreview config={config as MultipleChoiceConfig} />
      case "media_question":
        return <MediaPreview config={config as MediaConfig} />
      case "attachment_request":
        return (
          <div className="rounded-lg border bg-muted/30 p-6">
            <h3 className="text-lg font-semibold">
              {(config as { title?: { en: string; ar: string } }).title?.[
                lang
              ] || "Request for Attachment"}
            </h3>
            <p className="mt-2 text-muted-foreground">
              File upload request will appear here
            </p>
          </div>
        )
      default:
        return (
          <div className="rounded-lg border bg-muted/30 p-6">
            <p className="text-muted-foreground">
              Preview not available for this tool type
            </p>
          </div>
        )
    }
  }

  const renderResponseView = () => {
    if (assignment.status !== "completed") {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-medium">Not Yet Completed</h3>
          <p className="text-muted-foreground">
            This assignment is still pending. Responses will appear here once
            the case completes it.
          </p>
        </div>
      )
    }

    if (
      !assignment.responses ||
      Object.keys(assignment.responses).length === 0
    ) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-medium">No Responses</h3>
          <p className="text-muted-foreground">
            No response data available for this assignment.
          </p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <div className="rounded-lg border bg-muted/30 p-4">
          <h4 className="mb-2 font-medium">Response Data</h4>
          <pre className="max-h-96 overflow-auto rounded bg-background p-4 text-sm">
            {JSON.stringify(assignment.responses, null, 2)}
          </pre>
        </div>

        {assignment.media && assignment.media.length > 0 && (
          <div className="rounded-lg border bg-muted/30 p-4">
            <h4 className="mb-2 font-medium">Uploaded Files</h4>
            <ul className="space-y-2">
              {assignment.media.map((file, idx) => (
                <li key={idx} className="text-sm">
                  <a
                    href={file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    File {idx + 1}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/admin/assignments")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-primary">
              Assignment Details
            </h1>
            <p className="text-muted-foreground">
              View assignment and responses
            </p>
          </div>
        </div>
      </div>

      {/* Assignment Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Assignment Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Case
              </span>
              <p>
                <Link
                  href={`/dashboard/cases/${profile.id}`}
                  className="hover:text-primary hover:underline"
                >
                  {profile.name}
                </Link>
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Assignment
              </span>
              <p>{assignment.name_en || "Unnamed Assignment"}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Type
              </span>
              <div>
                <Badge variant="outline">
                  {toolTypeLabels[typeName] || typeName}
                </Badge>
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Status
              </span>
              <div>
                <Badge className={statusColors[assignment.status]}>
                  {statusLabels[assignment.status]}
                </Badge>
              </div>
            </div>
          </div>
          <div className="mt-4 border-t pt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <span className="text-sm font-medium text-muted-foreground">
                  Assigned Date
                </span>
                <p>
                  {new Date(
                    assignment.assigned_at || assignment.created
                  ).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">
                  Visible to User
                </span>
                <p>{assignment.is_visible_to_user ? "Yes" : "No"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="view" className="space-y-4">
        <TabsList>
          <TabsTrigger value="view">View</TabsTrigger>
          <TabsTrigger value="response">Response</TabsTrigger>
        </TabsList>

        <TabsContent value="view">
          <Card>
            <CardHeader>
              <CardTitle>Tool Preview</CardTitle>
              <CardDescription>
                How the tool appears to the case (using config snapshot)
              </CardDescription>
            </CardHeader>
            <CardContent>{renderToolPreview()}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="response">
          <Card>
            <CardHeader>
              <CardTitle>Response</CardTitle>
              <CardDescription>
                Submitted responses and uploaded files
              </CardDescription>
            </CardHeader>
            <CardContent>{renderResponseView()}</CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
