"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import { useUsers } from "@/hooks/useUsers"
import { useProfiles } from "@/hooks/useProfiles"
import pb from "@/lib/pb"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  Users,
  Mail,
  Phone,
  Calendar,
  FolderKanban,
  Plus,
  Eye,
} from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/i18n"
import type { Profile } from "@/types/profile"

const GRADES = [
  { value: "kg1", label: "KG 1" },
  { value: "kg2", label: "KG 2" },
  { value: "grade1", label: "Grade 1" },
  { value: "grade2", label: "Grade 2" },
  { value: "grade3", label: "Grade 3" },
  { value: "grade4", label: "Grade 4" },
  { value: "grade5", label: "Grade 5" },
  { value: "grade6", label: "Grade 6" },
  { value: "grade7", label: "Grade 7" },
  { value: "grade8", label: "Grade 8" },
  { value: "grade9", label: "Grade 9" },
  { value: "grade10", label: "Grade 10" },
  { value: "grade11", label: "Grade 11" },
  { value: "grade12", label: "Grade 12" },
  { value: "university", label: "University" },
]

const roleLabels: Record<string, string> = {
  user: "User",
  admin: "Admin",
  individual: "Individual",
  parent: "Parent",
  organization: "Organization",
  expert: "Expert",
  super_admin: "Super Admin",
}

export default function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: userId } = use(params)
  const router = useRouter()
  const { users } = useUsers()
  const { profiles, isLoading: isProfilesLoading, refresh: refreshProfiles } = useProfiles()

  const [activeTab, setActiveTab] = useState("overview")
  const [showAddCaseModal, setShowAddCaseModal] = useState(false)
  const [isSubmittingCase, setIsSubmittingCase] = useState(false)
  const [caseFormError, setCaseFormError] = useState<string | null>(null)
  const [caseFormData, setCaseFormData] = useState({
    name: "",
    date_of_birth: "",
    gender: "" as "male" | "female" | "",
    grade: "",
    notes: "",
  })

  const user = users.find((u) => u.id === userId)

  const userCases = profiles.filter((p) => p.user === userId)

  const handleAddCase = async (e: React.FormEvent) => {
    e.preventDefault()
    setCaseFormError(null)

    if (!caseFormData.name) {
      setCaseFormError("Case name is required.")
      return
    }

    setIsSubmittingCase(true)
    try {
      await pb.collection("cases").create({
        user: userId,
        name: caseFormData.name,
        date_of_birth: caseFormData.date_of_birth,
        gender: caseFormData.gender || undefined,
        grade: caseFormData.grade,
        notes: caseFormData.notes,
      })
      setShowAddCaseModal(false)
      setCaseFormData({
        name: "",
        date_of_birth: "",
        gender: "",
        grade: "",
        notes: "",
      })
      // Refresh profiles to show new case
      refreshProfiles()
    } catch (error: any) {
      setCaseFormError(error?.message || "Failed to create case. Please try again.")
    } finally {
      setIsSubmittingCase(false)
    }
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="mb-4 text-xl font-medium">User not found</h2>
        <Link href="/dashboard/admin/users">
          <Button>Back to Users</Button>
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
          <h1 className="text-2xl font-bold text-primary">{user.name}</h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
        <Badge
          variant="outline"
          className={
            user.is_active
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }
        >
          {user.is_active ? "Active" : "Inactive"}
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cases">
            Cases
            <Badge variant="secondary" className="ms-2">
              {userCases.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    {user.email}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Role</span>
                  <span className="font-medium capitalize">
                    {roleLabels[user.role] || user.role}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge
                    variant="outline"
                    className={
                      user.is_active
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }
                  >
                    {user.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                {user.contact_number && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Contact</span>
                    <span className="font-medium flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      {user.contact_number}
                    </span>
                  </div>
                )}
                {user.organization_name && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Organization</span>
                    <span className="font-medium">{user.organization_name}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    {formatDate(user.created)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderKanban className="h-5 w-5" />
                  Cases Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Cases</span>
                  <span className="font-medium">{userCases.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Latest Case</span>
                  <span className="font-medium">
                    {userCases.length > 0
                      ? userCases[userCases.length - 1].name
                      : "—"}
                  </span>
                </div>
                <div className="pt-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setActiveTab("cases")}
                  >
                    View All Cases
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cases">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FolderKanban className="h-5 w-5" />
                  Cases
                </CardTitle>
                <CardDescription>
                  Manage cases for {user.name}
                </CardDescription>
              </div>
              <Button onClick={() => setShowAddCaseModal(true)}>
                <Plus className="me-2 h-4 w-4" />
                Add Case
              </Button>
            </CardHeader>
            <CardContent>
              {isProfilesLoading ? (
                <div className="py-8 text-center text-muted-foreground">
                  Loading cases...
                </div>
              ) : userCases.length === 0 ? (
                <div className="py-8 text-center">
                  <FolderKanban className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-medium">No cases yet</h3>
                  <p className="text-muted-foreground mb-4">
                    This user has no cases. Click "Add Case" to create one.
                  </p>
                  <Button onClick={() => setShowAddCaseModal(true)}>
                    <Plus className="me-2 h-4 w-4" />
                    Add Case
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Case Name</TableHead>
                      <TableHead>Date of Birth</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userCases.map((profile: Profile) => (
                      <TableRow key={profile.id}>
                        <TableCell className="font-medium">
                          {profile.name}
                        </TableCell>
                        <TableCell>
                          {profile.date_of_birth
                            ? formatDate(profile.date_of_birth)
                            : "—"}
                        </TableCell>
                        <TableCell className="capitalize">
                          {profile.gender || "—"}
                        </TableCell>
                        <TableCell className="capitalize">
                          {profile.grade || "—"}
                        </TableCell>
                        <TableCell>{formatDate(profile.created)}</TableCell>
                        <TableCell className="text-right">
                          <Link href={`/dashboard/admin/cases/${profile.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="me-1 h-4 w-4" />
                              View
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Case Modal */}
      {showAddCaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="mx-4 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Add New Case for {user.name}</CardTitle>
              <CardDescription>
                Create a new case and assign it to this user.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddCase} className="space-y-4">
                {caseFormError && (
                  <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    {caseFormError}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="case_name">
                    Case Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="case_name"
                    value={caseFormData.name}
                    onChange={(e) =>
                      setCaseFormData({ ...caseFormData, name: e.target.value })
                    }
                    placeholder="Enter case name"
                    required
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={caseFormData.date_of_birth}
                      onChange={(e) =>
                        setCaseFormData({
                          ...caseFormData,
                          date_of_birth: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={caseFormData.gender}
                      onValueChange={(value) =>
                        setCaseFormData({
                          ...caseFormData,
                          gender: value as "male" | "female",
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="grade">Grade</Label>
                  <Select
                    value={caseFormData.grade}
                    onValueChange={(value) =>
                      setCaseFormData({ ...caseFormData, grade: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {GRADES.map((grade) => (
                        <SelectItem key={grade.value} value={grade.value}>
                          {grade.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    value={caseFormData.notes}
                    onChange={(e) =>
                      setCaseFormData({ ...caseFormData, notes: e.target.value })
                    }
                    placeholder="Additional notes"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddCaseModal(false)
                      setCaseFormError(null)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmittingCase}>
                    {isSubmittingCase ? "Creating..." : "Create Case"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
