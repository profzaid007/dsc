"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { useProfiles } from "@/hooks/useProfiles"
import { useAssignments } from "@/hooks/useAssignments"
import { useTools } from "@/hooks/useTools"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, History } from "lucide-react"
import Link from "next/link"

export default function ProfileHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { getProfileById } = useProfiles()
  const { assignments, responses } = useAssignments()
  const { getToolById } = useTools()

  const profile = getProfileById(id)
  const profileAssignments = assignments.filter((a) => a.profileId === id)

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

  const completedAssignments = profileAssignments.filter(
    (a) => a.status === "completed"
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-primary">History</h1>
          <p className="text-muted-foreground">
            Response history for {profile.childName}
          </p>
        </div>
      </div>

      {completedAssignments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <History className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-medium">No history yet</h3>
            <p className="text-center text-muted-foreground">
              Completed tools will appear here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {completedAssignments.map((assignment) => {
            const tool = getToolById(assignment.toolId)
            const assignmentResponses = responses.filter(
              (r) => r.profileToolId === assignment.id
            )
            return (
              <Card key={assignment.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{tool?.name.en || "Unknown Tool"}</CardTitle>
                    <Badge variant="default">Completed</Badge>
                  </div>
                  <CardDescription>
                    Completed{" "}
                    {assignment.completedAt &&
                      new Date(assignment.completedAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {assignmentResponses.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Responses:</p>
                      <pre className="overflow-auto rounded-lg bg-muted p-3 text-xs">
                        {JSON.stringify(assignmentResponses[0].data, null, 2)}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
