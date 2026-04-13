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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Calendar,
  Mail,
  Phone,
  User,
  ClipboardList,
  History,
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
  const { getToolById } = useTools()

  const profile = getProfileById(id)
  const assignments = getAssignmentsByCase(id)
  const visibleAssignments = getVisibleAssignments(id)

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
          <h1 className="text-2xl font-bold text-primary">{profile.name}</h1>
          <p className="text-muted-foreground">
            Created {new Date(profile.created).toLocaleDateString()}
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tools">
            Tools
            {visibleAssignments.length > 0 && (
              <Badge variant="secondary" className="ms-2">
                {visibleAssignments.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
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

        <TabsContent value="tools">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Assigned Tools
              </CardTitle>
              <CardDescription>Tools assigned to this profile</CardDescription>
            </CardHeader>
            <CardContent>
              {visibleAssignments.length === 0 ? (
                <div className="py-8 text-center">
                  <ClipboardList className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-medium">
                    No tools assigned
                  </h3>
                  <p className="text-muted-foreground">
                    Tools will appear here once assigned by an admin
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {visibleAssignments.map((assignment) => {
                    const tool = getToolById(assignment.tool)
                    return (
                      <Link
                        key={assignment.id}
                        href={`/dashboard/profiles/${id}/tools/${assignment.id}`}
                      >
                        <div className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50">
                          <div>
                            <p className="font-medium">
                              {tool?.name.en || "Unknown Tool"}
                            </p>
                            <p className="text-sm text-muted-foreground capitalize">
                              {assignment.status.replace("_", " ")}
                            </p>
                          </div>
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
                      </Link>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Response History
              </CardTitle>
              <CardDescription>
                History of all submitted responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              {assignments.filter((a) => a.status === "completed").length ===
              0 ? (
                <div className="py-8 text-center">
                  <History className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-medium">No history yet</h3>
                  <p className="text-muted-foreground">
                    Completed tools will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {assignments
                    .filter((a) => a.status === "completed")
                    .map((assignment) => {
                      const tool = getToolById(assignment.tool)
                      return (
                        <div
                          key={assignment.id}
                          className="flex items-center justify-between rounded-lg border p-4"
                        >
                          <div>
                            <p className="font-medium">
                              {tool?.name.en || "Unknown Tool"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Completed{" "}
                              {assignment.updated &&
                                new Date(
                                  assignment.updated
                                ).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="default">Completed</Badge>
                        </div>
                      )
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
