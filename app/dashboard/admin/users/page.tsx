"use client"

import { useState, useMemo } from "react"
import { useUsers } from "@/hooks/useUsers"
import { useProfiles } from "@/hooks/useProfiles"
import { useLang } from "@/lib/lang-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Plus,
  Users,
  Search,
  ArrowUp,
  ArrowDown,
  Eye,
} from "lucide-react"
import type { User, UserRole } from "@/types/user"

const ALL_ROLES: UserRole[] = [
  "user",
  "admin",
  "individual",
  "parent",
  "organization",
  "expert",
  "super_admin",
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

export default function AdminUsersPage() {
  const { lang } = useLang()
  const { users, isLoading: isUsersLoading, addUser, updateUser } = useUsers()
  const { profiles, isLoading: isProfilesLoading } = useProfiles()

  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<string>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const [showAddModal, setShowAddModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
    role: "user" as UserRole,
    contact_number: "",
    is_active: true,
  })

  const isLoading = isUsersLoading || isProfilesLoading

  const caseCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    profiles.forEach((p) => {
      counts[p.user] = (counts[p.user] || 0) + 1
    })
    return counts
  }, [profiles])

  const filteredUsers = users.filter((user) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      user.name?.toLowerCase().includes(q) ||
      user.email?.toLowerCase().includes(q) ||
      user.role?.toLowerCase().includes(q)
    )
  })

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const getVal = (u: User) => {
      const v = u[sortField as keyof User]
      return (v?.toString() || "").toLowerCase()
    }
    const cmp = getVal(a).localeCompare(getVal(b))
    return sortDirection === "asc" ? cmp : -cmp
  })

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateUser(userId, { role: newRole as UserRole })
    } catch {
      // Error already logged in hook
    }
  }

  const handleStatusChange = async (userId: string, isActive: boolean) => {
    try {
      await updateUser(userId, { is_active: isActive })
    } catch {
      // Error already logged in hook
    }
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!formData.name || !formData.email || !formData.password) {
      setFormError(
        lang === "ar" ? "يرجى ملء جميع الحقول المطلوبة." : "Please fill in all required fields."
      )
      return
    }
    if (formData.password !== formData.passwordConfirm) {
      setFormError(
        lang === "ar" ? "كلمتا المرور غير متطابقتين." : "Passwords do not match."
      )
      return
    }

    setIsSubmitting(true)
    try {
      await addUser({
        email: formData.email.toLowerCase(),
        password: formData.password,
        passwordConfirm: formData.passwordConfirm,
        name: formData.name,
        role: formData.role,
        contact_number: formData.contact_number,
        is_active: formData.is_active,
      })
      setShowAddModal(false)
      setFormData({
        name: "",
        email: "",
        password: "",
        passwordConfirm: "",
        role: "user",
        contact_number: "",
        is_active: true,
      })
    } catch (error: any) {
      setFormError(
        error?.message ||
          (lang === "ar"
            ? "فشل إنشاء المستخدم. حاول مرة أخرى."
            : "Failed to create user. Please try again.")
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">
              {lang === "ar" ? "المستخدمون" : "Users"}
            </h1>
            <p className="text-muted-foreground">
              {lang === "ar" ? "إدارة جميع المستخدمين" : "Manage all users"}
            </p>
          </div>
          <Button disabled>
            <Plus className="me-2 h-4 w-4" />
            {lang === "ar" ? "إضافة مستخدم" : "Add User"}
          </Button>
        </div>
        <SkeletonTable rows={6} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">
            {lang === "ar" ? "المستخدمون" : "Users"}
          </h1>
          <p className="text-muted-foreground">
            {lang === "ar" ? "إدارة جميع المستخدمين" : "Manage all users"}
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="me-2 h-4 w-4" />
          {lang === "ar" ? "إضافة مستخدم" : "Add User"}
        </Button>
      </div>

      {/* Search & Sort */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={
              lang === "ar"
                ? "ابحث بالاسم أو البريد الإلكتروني أو الدور..."
                : "Search by name, email, or role..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {lang === "ar" ? "ترتيب حسب" : "Sort by"}
          </span>
          <Select value={sortField} onValueChange={(value) => setSortField(value)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">
                {lang === "ar" ? "الاسم" : "Name"}
              </SelectItem>
              <SelectItem value="email">
                {lang === "ar" ? "البريد الإلكتروني" : "Email"}
              </SelectItem>
              <SelectItem value="role">
                {lang === "ar" ? "الدور" : "Role"}
              </SelectItem>
              <SelectItem value="created">
                {lang === "ar" ? "تاريخ الإنشاء" : "Created"}
              </SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))}
          >
            {sortDirection === "asc" ? (
              <ArrowUp className="h-3 w-3" />
            ) : (
              <ArrowDown className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>

      {sortedUsers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-medium">
              {users.length === 0
                ? lang === "ar"
                  ? "لا يوجد مستخدمون بعد"
                  : "No users yet"
                : lang === "ar"
                  ? "لا يوجد مستخدمون مطابقون لبحثك"
                  : "No users match your search"}
            </h3>
            <p className="mb-4 text-center text-muted-foreground">
              {users.length === 0
                ? lang === "ar"
                  ? "أضف مستخدمك الأول للبدء"
                  : "Add your first user to get started"
                : lang === "ar"
                  ? "حاول تعديل استعلام البحث"
                  : "Try adjusting your search query"}
            </p>
            {users.length === 0 && (
              <Button onClick={() => setShowAddModal(true)}>
                {lang === "ar" ? "إضافة مستخدم" : "Add User"}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{lang === "ar" ? "جميع المستخدمين" : "All Users"}</CardTitle>
            <CardDescription>
              {lang === "ar"
                ? `تم العثور على ${sortedUsers.length} مستخدم`
                : `${sortedUsers.length} user(s) found`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">
                    {lang === "ar" ? "الاسم" : "Name"}
                  </TableHead>
                  <TableHead>
                    {lang === "ar" ? "البريد الإلكتروني" : "Email"}
                  </TableHead>
                  <TableHead>{lang === "ar" ? "الدور" : "Role"}</TableHead>
                  <TableHead>{lang === "ar" ? "الحالة" : "Status"}</TableHead>
                  <TableHead>{lang === "ar" ? "الحالات" : "Cases"}</TableHead>
                  <TableHead className="text-right">
                    {lang === "ar" ? "الإجراءات" : "Actions"}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {user.name}
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.role === "super_admin" ? (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700">
                          {roleLabels[user.role]?.[lang] || user.role}
                        </Badge>
                      ) : (
                        <Select
                          value={user.role}
                          onValueChange={(value) => handleRoleChange(user.id, value)}
                        >
                          <SelectTrigger className="h-8 w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ALL_ROLES.filter((r) => r !== "super_admin").map((role) => (
                              <SelectItem key={role} value={role}>
                                {roleLabels[role]?.[lang] || role}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={user.is_active}
                          disabled={user.role === "super_admin"}
                          onCheckedChange={(checked) => handleStatusChange(user.id, checked)}
                        />
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
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {caseCounts[user.id] || 0}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <SmartLink href={`/dashboard/admin/users/${user.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="me-1 h-4 w-4" />
                          {lang === "ar" ? "عرض" : "View"}
                        </Button>
                      </SmartLink>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="mx-4 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>{lang === "ar" ? "إضافة مستخدم جديد" : "Add New User"}</CardTitle>
              <CardDescription>
                {lang === "ar"
                  ? "أنشئ حساب مستخدم جديد. سيتمكن المستخدم من تسجيل الدخول باستخدام بريده الإلكتروني وكلمة المرور."
                  : "Create a new user account. The user will be able to log in with their email and password."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddUser} className="space-y-4">
                {formError && (
                  <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    {formError}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="name">
                    {lang === "ar" ? "الاسم الكامل" : "Full Name"} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={lang === "ar" ? "أدخل الاسم الكامل" : "Enter full name"}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">
                    {lang === "ar" ? "البريد الإلكتروني" : "Email"} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder={lang === "ar" ? "أدخل عنوان البريد الإلكتروني" : "Enter email address"}
                    required
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="password">
                      {lang === "ar" ? "كلمة المرور" : "Password"} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder={lang === "ar" ? "8 أحرف على الأقل" : "Min 8 characters"}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passwordConfirm">
                      {lang === "ar" ? "تأكيد كلمة المرور" : "Confirm Password"} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="passwordConfirm"
                      type="password"
                      value={formData.passwordConfirm}
                      onChange={(e) =>
                        setFormData({ ...formData, passwordConfirm: e.target.value })
                      }
                      placeholder={lang === "ar" ? "أكد كلمة المرور" : "Confirm password"}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="role">
                      {lang === "ar" ? "الدور" : "Role"}
                    </Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) =>
                        setFormData({ ...formData, role: value as UserRole })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ALL_ROLES.filter((r) => r !== "super_admin").map((role) => (
                          <SelectItem key={role} value={role}>
                            {roleLabels[role]?.[lang] || role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_number">
                      {lang === "ar" ? "رقم الاتصال" : "Contact Number"}
                    </Label>
                    <Input
                      id="contact_number"
                      value={formData.contact_number}
                      onChange={(e) =>
                        setFormData({ ...formData, contact_number: e.target.value })
                      }
                      placeholder={lang === "ar" ? "رقم الهاتف" : "Phone number"}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_active: checked })
                    }
                  />
                  <Label htmlFor="is_active" className="cursor-pointer">
                    {lang === "ar" ? "حساب نشط" : "Active account"}
                  </Label>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddModal(false)
                      setFormError(null)
                    }}
                  >
                    {lang === "ar" ? "إلغاء" : "Cancel"}
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting
                      ? lang === "ar"
                        ? "جارٍ الإنشاء..."
                        : "Creating..."
                      : lang === "ar"
                        ? "إنشاء مستخدم"
                        : "Create User"}
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
