"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { useProfiles } from "@/hooks/useProfiles"
import { useAssignments } from "@/hooks/useAssignments"
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
import { ArrowLeft, History } from "lucide-react"
import Link from "next/link"

export default function ProfileHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { lang } = useLang()
  const { getProfileById } = useProfiles()
  const { assignments } = useAssignments(id)

  const profile = getProfileById(id)
  const profileAssignments = assignments.filter((a) => a.case === id)

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
            Response history for {profile.name}
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
          {completedAssignments.map((assignment) => (
            <Card key={assignment.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {lang === "ar"
                      ? assignment.name_ar || assignment.name_en
                      : assignment.name_en}
                  </CardTitle>
                  <Badge variant="default">Completed</Badge>
                </div>
                <CardDescription>
                  Updated{" "}
                  {assignment.updated &&
                    new Date(assignment.updated).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {assignment.responses &&
                  Object.keys(assignment.responses).length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Responses:</p>
                      <pre className="overflow-auto rounded-lg bg-muted p-3 text-xs">
                        {JSON.stringify(assignment.responses, null, 2)}
                      </pre>
                    </div>
                  )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
