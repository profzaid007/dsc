"use client"

import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { useProfiles } from "@/hooks/useProfiles"
import { useAssignments } from "@/hooks/useAssignments"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, FolderKanban, ClipboardCheck, Activity } from "lucide-react"

export default function DashboardPage() {
  const { currentUser } = useAuth()
  const { profiles } = useProfiles()
  const { assignments } = useAssignments()

  const stats = [
    {
      title: "Cases",
      value: profiles.length,
      icon: Users,
      href: "/dashboard/profiles",
    },
    {
      title: "Total Assignments",
      value: assignments.length,
      icon: ClipboardCheck,
      href: "/dashboard/profiles",
    },
    {
      title: "Completed",
      value: assignments.filter((a) => a.status === "completed").length,
      icon: Activity,
      href: "/dashboard/profiles",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {currentUser?.name}
          </p>
        </div>
        <Link href="/dashboard/cases/new">
          <Button>New Case</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {profiles.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderKanban className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-medium">No cases yet</h3>
            <p className="mb-4 text-center text-muted-foreground">
              Create your first case to get started
            </p>
            <Link href="/dashboard/cases/new">
              <Button>Create Case</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
