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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Calendar,
  Mail,
  Phone,
  User,
  ClipboardList,
  History,
  Eye,
  Download,
} from "lucide-react"
import Link from "next/link"

export default function ProfileDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { lang } = useLang()
  const { getProfileById } = useProfiles()
  const { getAssignmentsByCase, getVisibleAssignments } = useAssignments(id)

  const profile = getProfileById(id)
  const assignments = getAssignmentsByCase(id)
  const visibleAssignments = getVisibleAssignments(id)

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="mb-4 text-xl font-medium">Case not found</h2>
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
          <h1 className="text-2xl font-bold text-primary">{profile.name}</h1>
          <p className="text-muted-foreground">
            Created {new Date(profile.created).toLocaleDateString()}
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">
            Tasks
            {visibleAssignments.length > 0 && (
              <Badge variant="secondary" className="ms-2">
                {visibleAssignments.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="case-file">Case File</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Child Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date of Birth</span>
                  <span className="font-medium">{profile.date_of_birth}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gender</span>
                  <span className="font-medium capitalize">
                    {profile.gender}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Grade</span>
                  <span className="font-medium capitalize">
                    {profile.grade}
                  </span>
                </div>
                {profile.main_concerns.length > 0 && (
                  <div className="pt-2">
                    <span className="mb-2 block text-muted-foreground">
                      Main Concerns
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {profile.main_concerns.map((concern) => (
                        <Badge key={concern} variant="outline">
                          {concern}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {profile.notes && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{profile.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Assigned Tasks
              </CardTitle>
              <CardDescription>Tasks assigned to this profile</CardDescription>
            </CardHeader>
            <CardContent>
              {visibleAssignments.length === 0 ? (
                <div className="py-8 text-center">
                  <ClipboardList className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-medium">
                    No tasks assigned
                  </h3>
                  <p className="text-muted-foreground">
                    Tasks will appear here once assigned by an admin
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {visibleAssignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex-1">
                        <Link
                          href={`/dashboard/cases/${id}/tasks/${assignment.id}`}
                        >
                          <p className="font-medium hover:underline">
                            {lang === "ar"
                              ? assignment.name_ar || assignment.name_en
                              : assignment.name_en}
                          </p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {assignment.status.replace("_", " ")}
                          </p>
                        </Link>
                      </div>
                      <div className="flex items-center gap-2">
                        {assignment.status === "completed" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const responses = assignment.responses
                              if (
                                responses &&
                                Object.keys(responses).length > 0
                              ) {
                                const printWindow = window.open(
                                  "",
                                  "_blank",
                                  "width=800,height=600"
                                )
                                if (printWindow) {
                                  printWindow.document.write(`
                                    <html>
                                      <head>
                                        <title>${assignment.name_en || "Responses"}</title>
                                        <style>
                                          body { font-family: system-ui, sans-serif; padding: 20px; }
                                          h1 { margin-bottom: 10px; }
                                          .meta { color: #666; margin-bottom: 20px; }
                                          .response { margin-bottom: 15px; padding: 10px; background: #f5f5f5; border-radius: 4px; }
                                          .question { font-weight: bold; margin-bottom: 5px; }
                                          @media print { .no-print { display: none; } }
                                        </style>
                                      </head>
                                      <body>
                                        <h1>${assignment.name_en || "Responses"}</h1>
                                        <p class="meta">Profile: ${profile.name} | Date: ${new Date(assignment.updated).toLocaleDateString()}</p>
                                        <pre style="white-space: pre-wrap; background: #f5f5f5; padding: 15px; border-radius: 4px;">${JSON.stringify(responses, null, 2)}</pre>
                                        <button class="no-print" onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; cursor: pointer;">Print / Save as PDF</button>
                                      </body>
                                    </html>
                                  `)
                                  printWindow.document.close()
                                }
                              }
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        <Badge
                          variant={
                            assignment.status === "completed"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {assignment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="case-file">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Case File
              </CardTitle>
              <CardDescription>
                History of all interactions between the case and the expert
              </CardDescription>
            </CardHeader>
            <CardContent>
              {assignments.filter((a) => a.status === "completed").length ===
              0 ? (
                <div className="py-8 text-center">
                  <History className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-medium">No history yet</h3>
                  <p className="text-muted-foreground">
                    Completed tasks will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {assignments
                    .filter((a) => a.status === "completed")
                    .map((assignment) => (
                      <div
                        key={assignment.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div>
                          <p className="font-medium">
                            {lang === "ar"
                              ? assignment.name_ar || assignment.name_en
                              : assignment.name_en}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Completed{" "}
                            {assignment.updated &&
                              new Date(assignment.updated).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="default">Completed</Badge>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
