"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useProfiles } from "@/hooks/useProfiles"
import { useAssignments } from "@/hooks/useAssignments"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { PageLoader } from "@/components/ui/page-loader"
import { SkeletonTable } from "@/components/ui/skeleton"
import { SmartLink } from "@/components/smart-link"
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
  Eye,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react"

import { formatDate } from "@/lib/i18n"
import type { Profile } from "@/types/profile"

interface AssignmentCount {
  total: number
  pending: number
  assigned: number
  in_progress: number
  completed: number
}

export default function AdminCasesPage() {
  const { profiles, isLoading: isProfilesLoading } = useProfiles()
  const { assignments, isLoading: isAssignmentsLoading } = useAssignments()

  const [assignmentCounts, setAssignmentCounts] = useState<
    Record<string, AssignmentCount>
  >({})

  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<string>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <ArrowUpDown className="ml-1 inline h-3 w-3" />
    return sortDirection === "asc"
      ? <ArrowUp className="ml-1 inline h-3 w-3" />
      : <ArrowDown className="ml-1 inline h-3 w-3" />
  }

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

  const isLoading = isProfilesLoading || isAssignmentsLoading

  const filteredProfiles = profiles.filter((profile) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      profile.name?.toLowerCase().includes(q) ||
      profile.gender?.toLowerCase().includes(q) ||
      profile.grade?.toLowerCase().includes(q)
    )
  })

  const sortedProfiles = [...filteredProfiles].sort((a, b) => {
    const getVal = (p: Profile) => {
      const v = p[sortField as keyof Profile]
      return (v?.toString() || "").toLowerCase()
    }
    const cmp = getVal(a).localeCompare(getVal(b))
    return sortDirection === "asc" ? cmp : -cmp
  })

  if (isLoading) {
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
        <SkeletonTable rows={6} />
      </div>
    )
  }

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

      {/* Search */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, gender, or grade..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {sortedProfiles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderKanban className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-medium">
              {profiles.length === 0 ? "No cases yet" : "No cases match your search"}
            </h3>
            <p className="mb-4 text-center text-muted-foreground">
              {profiles.length === 0
                ? "Create your first case to get started"
                : "Try adjusting your search query"}
            </p>
            {profiles.length === 0 && (
              <Link href="/dashboard/cases/new">
                <Button>Create Case</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Cases</CardTitle>
            <CardDescription>
              {sortedProfiles.length} case(s) found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="w-[250px] cursor-pointer select-none"
                    onClick={() => handleSort("name")}
                  >
                    Case Name <SortIcon field="name" />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => handleSort("date_of_birth")}
                  >
                    Date of Birth <SortIcon field="date_of_birth" />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => handleSort("gender")}
                  >
                    Gender <SortIcon field="gender" />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => handleSort("grade")}
                  >
                    Grade <SortIcon field="grade" />
                  </TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Assignments</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedProfiles.map((profile) => {
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
                      <TableCell>{formatDate(profile.date_of_birth || "")}</TableCell>
                      <TableCell className="capitalize">
                        {profile.gender}
                      </TableCell>
                      <TableCell className="capitalize">
                        {profile.grade}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {profile.expand?.user
                            ? `${profile.expand.user.name} (${profile.expand.user.email})`
                            : "—"}
                        </span>
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
                        <SmartLink href={`/dashboard/admin/cases/${profile.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="me-1 h-4 w-4" />
                            View
                          </Button>
                        </SmartLink>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
