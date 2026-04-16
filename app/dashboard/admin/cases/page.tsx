"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useProfiles } from "@/hooks/useProfiles"
import { useAssignments } from "@/hooks/useAssignments"
import { useToolTypes } from "@/hooks/useToolTypes"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Plus,
  FolderKanban,
  User,
  Calendar,
  Mail,
  Phone,
  Eye,
} from "lucide-react"

interface AssignmentCount {
  total: number
  pending: number
  assigned: number
  in_progress: number
  completed: number
}

export default function AdminCasesPage() {
  const router = useRouter()
  const { profiles } = useProfiles()
  const { assignments } = useAssignments()

  const [assignmentCounts, setAssignmentCounts] = useState<
    Record<string, AssignmentCount>
  >({})

  useEffect(() => {
    const counts: Record<string, AssignmentCount> = {}
    assignments.forEach((a) => {
      if (!counts[a.case]) {
        counts[a.case] = {
          total: 0,
          pending: 0,
          assigned: 0,
          in_progress: 0,
          completed: 0,
        }
      }
      counts[a.case].total++
      if (a.status === "pending") counts[a.case].pending++
      else if (a.status === "assigned") counts[a.case].assigned++
      else if (a.status === "in_progress") counts[a.case].in_progress++
      else if (a.status === "completed") counts[a.case].completed++
    })
    setAssignmentCounts(counts)
  }, [assignments])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Cases</h1>
          <p className="text-muted-foreground">Manage all cases</p>
        </div>
        <Link href="/dashboard/cases/new">
          <Button>
            <Plus className="me-2 h-4 w-4" />
            New Case
          </Button>
        </Link>
      </div>

      {profiles.length === 0 ? (
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
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Case Name</TableHead>
                <TableHead>Date of Birth</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Assignments</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((profile) => {
                const counts = assignmentCounts[profile.id] || {
                  total: 0,
                  pending: 0,
                  assigned: 0,
                  in_progress: 0,
                  completed: 0,
                }
                return (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {profile.name}
                      </div>
                    </TableCell>
                    <TableCell>{profile.date_of_birth}</TableCell>
                    <TableCell className="capitalize">
                      {profile.gender}
                    </TableCell>
                    <TableCell className="capitalize">
                      {profile.grade}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-1">
                        {counts.total === 0 ? (
                          <span className="text-sm text-muted-foreground">
                            No assignments
                          </span>
                        ) : (
                          <>
                            {counts.pending > 0 && (
                              <Badge
                                key="pending"
                                variant="outline"
                                className="bg-yellow-50 text-yellow-700"
                              >
                                {counts.pending} pending
                              </Badge>
                            )}
                            {counts.assigned > 0 && (
                              <Badge
                                key="assigned"
                                variant="outline"
                                className="bg-blue-50 text-blue-700"
                              >
                                {counts.assigned} assigned
                              </Badge>
                            )}
                            {counts.in_progress > 0 && (
                              <Badge
                                key="in_progress"
                                variant="outline"
                                className="bg-purple-50 text-purple-700"
                              >
                                {counts.in_progress} in progress
                              </Badge>
                            )}
                            {counts.completed > 0 && (
                              <Badge
                                key="completed"
                                variant="outline"
                                className="bg-green-50 text-green-700"
                              >
                                {counts.completed} completed
                              </Badge>
                            )}
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/dashboard/admin/cases/${profile.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="me-1 h-4 w-4" />
                          View
                        </Button>
                      </Link>
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
