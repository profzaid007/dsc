"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import { useUsers } from "@/hooks/useUsers"
import { useProfiles } from "@/hooks/useProfiles"
import { useLang } from "@/lib/lang-context"
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
import { DateInput } from "@/components/ui/date-input"
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
import { formatDate } from "@/lib/format-date"
import type { Profile } from "@/types/profile"

const GRADES = [
  { value: "kg1", label: { en: "KG 1", ar: "روضة 1" } },
  { value: "kg2", label: { en: "KG 2", ar: "روضة 2" } },
  { value: "grade1", label: { en: "Grade 1", ar: "الصف الأول" } },
  { value: "grade2", label: { en: "Grade 2", ar: "الصف الثاني" } },
  { value: "grade3", label: { en: "Grade 3", ar: "الصف الثالث" } },
  { value: "grade4", label: { en: "Grade 4", ar: "الصف الرابع" } },
  { value: "grade5", label: { en: "Grade 5", ar: "الصف الخامس" } },
  { value: "grade6", label: { en: "Grade 6", ar: "الصف السادس" } },
  { value: "grade7", label: { en: "Grade 7", ar: "الصف السابع" } },
  { value: "grade8", label: { en: "Grade 8", ar: "الصف الثامن" } },
  { value: "grade9", label: { en: "Grade 9", ar: "الصف التاسع" } },
  { value: "grade10", label: { en: "Grade 10", ar: "الصف العاشر" } },
  { value: "grade11", label: { en: "Grade 11", ar: "الصف الحادي عشر" } },
  { value: "grade12", label: { en: "Grade 12", ar: "الصف الثاني عشر" } },
  { value: "university", label: { en: "University", ar: "الجامعة" } },
]

const roleLabels: Record<string, { en: string; ar: string }> = {
  user: { en: "User", ar: "مستخدم" },
  admin: { en: "Admin", ar: "مشرف" },
  individual: { en: "Individual", ar: "فرد" },
  parent: { en: "Parent", ar: "ولي أمر" },
  organization: { en: "Organization", ar: "منظمة" },
  expert: { en: "Expert", ar: "خبير" },
  super_admin: { en: "Super Admin", ar: "مشرف عام" },
}

export default function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: userId } = use(params)
  const router = useRouter()
  const { lang } = useLang()
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
      setCaseFormError(
        lang === "ar" ? "اسم الحالة مطلوب." : "Case name is required."
      )
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
      setCaseFormError(
        error?.message ||
          (lang === "ar"
            ? "فشل إنشاء الحالة. حاول مرة أخرى."
            : "Failed to create case. Please try again.")
      )
    } finally {
      setIsSubmittingCase(false)
    }
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="mb-4 text-xl font-medium">
          {lang === "ar" ? "المستخدم غير موجود" : "User not found"}
        </h2>
        <Link href="/dashboard/admin/users">
          <Button>
            {lang === "ar" ? "العودة إلى المستخدمين" : "Back to Users"}
          </Button>
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
          {user.is_active
            ? lang === "ar"
              ? "نشط"
              : "Active"
            : lang === "ar"
              ? "غير نشط"
              : "Inactive"}
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            {lang === "ar" ? "نظرة عامة" : "Overview"}
          </TabsTrigger>
          <TabsTrigger value="cases">
            {lang === "ar" ? "الحالات" : "Cases"}
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
                  {lang === "ar" ? "معلومات المستخدم" : "User Information"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {lang === "ar" ? "البريد الإلكتروني" : "Email"}
                  </span>
                  <span className="font-medium flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    {user.email}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {lang === "ar" ? "الدور" : "Role"}
                  </span>
                  <span className="font-medium capitalize">
                    {roleLabels[user.role]?.[lang] || user.role}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {lang === "ar" ? "الحالة" : "Status"}
                  </span>
                  <Badge
                    variant="outline"
                    className={
                      user.is_active
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }
                  >
                    {user.is_active
                      ? lang === "ar"
                        ? "نشط"
                        : "Active"
                      : lang === "ar"
                        ? "غير نشط"
                        : "Inactive"}
                  </Badge>
                </div>
                {user.contact_number && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {lang === "ar" ? "الاتصال" : "Contact"}
                    </span>
                    <span className="font-medium flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      {user.contact_number}
                    </span>
                  </div>
                )}
                {user.organization_name && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {lang === "ar" ? "المنظمة" : "Organization"}
                    </span>
                    <span className="font-medium">{user.organization_name}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {lang === "ar" ? "تاريخ الإنشاء" : "Created"}
                  </span>
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
                  {lang === "ar" ? "ملخص الحالات" : "Cases Summary"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {lang === "ar" ? "إجمالي الحالات" : "Total Cases"}
                  </span>
                  <span className="font-medium">{userCases.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {lang === "ar" ? "أحدث حالة" : "Latest Case"}
                  </span>
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
                    {lang === "ar" ? "عرض جميع الحالات" : "View All Cases"}
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
                  {lang === "ar" ? "الحالات" : "Cases"}
                </CardTitle>
                <CardDescription>
                  {lang === "ar"
                    ? `إدارة الحالات لـ ${user.name}`
                    : `Manage cases for ${user.name}`}
                </CardDescription>
              </div>
              <Button onClick={() => setShowAddCaseModal(true)}>
                <Plus className="me-2 h-4 w-4" />
                {lang === "ar" ? "إضافة حالة" : "Add Case"}
              </Button>
            </CardHeader>
            <CardContent>
              {isProfilesLoading ? (
                <div className="py-8 text-center text-muted-foreground">
                  {lang === "ar" ? "جارٍ تحميل الحالات..." : "Loading cases..."}
                </div>
              ) : userCases.length === 0 ? (
                <div className="py-8 text-center">
                  <FolderKanban className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-medium">
                    {lang === "ar" ? "لا توجد حالات بعد" : "No cases yet"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {lang === "ar"
                      ? 'لا توجد حالات لهذا المستخدم. انقر على "إضافة حالة" لإنشاء حالة.'
                      : 'This user has no cases. Click "Add Case" to create one.'}
                  </p>
                  <Button onClick={() => setShowAddCaseModal(true)}>
                    <Plus className="me-2 h-4 w-4" />
                    {lang === "ar" ? "إضافة حالة" : "Add Case"}
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        {lang === "ar" ? "اسم الحالة" : "Case Name"}
                      </TableHead>
                      <TableHead>
                        {lang === "ar" ? "تاريخ الميلاد" : "Date of Birth"}
                      </TableHead>
                      <TableHead>{lang === "ar" ? "الجنس" : "Gender"}</TableHead>
                      <TableHead>{lang === "ar" ? "الصف الدراسي" : "Grade"}</TableHead>
                      <TableHead>
                        {lang === "ar" ? "تاريخ الإنشاء" : "Created"}
                      </TableHead>
                      <TableHead className="text-right">
                        {lang === "ar" ? "الإجراءات" : "Actions"}
                      </TableHead>
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
                          {profile.gender === "male"
                            ? lang === "ar"
                              ? "ذكر"
                              : "male"
                            : profile.gender === "female"
                              ? lang === "ar"
                                ? "أنثى"
                                : "female"
                              : profile.gender || "—"}
                        </TableCell>
                        <TableCell className="capitalize">
                          {profile.grade || "—"}
                        </TableCell>
                        <TableCell>{formatDate(profile.created)}</TableCell>
                        <TableCell className="text-right">
                          <Link href={`/dashboard/admin/cases/${profile.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="me-1 h-4 w-4" />
                              {lang === "ar" ? "عرض" : "View"}
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
              <CardTitle>
                {lang === "ar"
                  ? `إضافة حالة جديدة لـ ${user.name}`
                  : `Add New Case for ${user.name}`}
              </CardTitle>
              <CardDescription>
                {lang === "ar"
                  ? "أنشئ حالة جديدة وخصصها لهذا المستخدم."
                  : "Create a new case and assign it to this user."}
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
                    {lang === "ar" ? "اسم الحالة" : "Case Name"} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="case_name"
                    value={caseFormData.name}
                    onChange={(e) =>
                      setCaseFormData({ ...caseFormData, name: e.target.value })
                    }
                    placeholder={lang === "ar" ? "أدخل اسم الحالة" : "Enter case name"}
                    required
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">
                      {lang === "ar" ? "تاريخ الميلاد" : "Date of Birth"}
                    </Label>
                    <DateInput
                      id="date_of_birth"
                      value={caseFormData.date_of_birth}
                      onChange={(v) =>
                        setCaseFormData({
                          ...caseFormData,
                          date_of_birth: v,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">
                      {lang === "ar" ? "الجنس" : "Gender"}
                    </Label>
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
                        <SelectValue
                          placeholder={
                            lang === "ar" ? "اختر الجنس" : "Select gender"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">
                          {lang === "ar" ? "ذكر" : "Male"}
                        </SelectItem>
                        <SelectItem value="female">
                          {lang === "ar" ? "أنثى" : "Female"}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="grade">
                    {lang === "ar" ? "الصف الدراسي" : "Grade"}
                  </Label>
                  <Select
                    value={caseFormData.grade}
                    onValueChange={(value) =>
                      setCaseFormData({ ...caseFormData, grade: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={lang === "ar" ? "اختر الصف" : "Select grade"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {GRADES.map((grade) => (
                        <SelectItem key={grade.value} value={grade.value}>
                          {grade.label[lang]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">
                    {lang === "ar" ? "ملاحظات" : "Notes"}
                  </Label>
                  <Input
                    id="notes"
                    value={caseFormData.notes}
                    onChange={(e) =>
                      setCaseFormData({ ...caseFormData, notes: e.target.value })
                    }
                    placeholder={lang === "ar" ? "ملاحظات إضافية" : "Additional notes"}
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
                    {lang === "ar" ? "إلغاء" : "Cancel"}
                  </Button>
                  <Button type="submit" disabled={isSubmittingCase}>
                    {isSubmittingCase
                      ? lang === "ar"
                        ? "جارٍ الإنشاء..."
                        : "Creating..."
                      : lang === "ar"
                        ? "إنشاء الحالة"
                        : "Create Case"}
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
