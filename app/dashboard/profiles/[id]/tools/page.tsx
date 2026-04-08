"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { useProfiles } from "@/hooks/useProfiles"
import { useAssignments } from "@/hooks/useAssignments"
import { useTools } from "@/hooks/useTools"
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
} from "lucide-react"
import Link from "next/link"

const toolTypeIcons: Record<string, typeof FileText> = {
  survey: FileText,
  multiple_answer: ClipboardList,
  media_question: Calendar,
  report: FileBarChart,
  plan: Layers,
}

const toolTypeLabels: Record<string, { en: string; ar: string }> = {
  survey: { en: "Survey", ar: "استبيان" },
  multiple_answer: { en: "Multiple Answer", ar: "إجابات متعددة" },
  media_question: { en: "Media Questions", ar: "أسئلة الوسائط" },
  report: { en: "Report", ar: "تقرير" },
  plan: { en: "Plan", ar: "خطة" },
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
  const { getToolById } = useTools()

  const profile = getProfileById(id)
  const assignments = getVisibleAssignments(id)

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="mb-4 text-xl font-medium">Profile not found</h2>
        <Link href="/dashboard/profiles">
          <Button>Back to Profiles</Button>
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
            const tool = getToolById(assignment.tool)
            const Icon = toolTypeIcons[tool?.type || "custom"]
            const typeLabel = toolTypeLabels[tool?.type || "custom"]

            return (
              <Link
                key={assignment.id}
                href={`/dashboard/profiles/${id}/tools/${assignment.id}`}
              >
                <Card className="h-full cursor-pointer transition-all hover:shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-primary" />
                        <CardTitle className="text-base">
                          {tool?.name.en || "Unknown Tool"}
                        </CardTitle>
                      </div>
                    </div>
                    <CardDescription>{typeLabel[lang]}</CardDescription>
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
