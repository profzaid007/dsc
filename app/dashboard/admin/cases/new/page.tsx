"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useProfiles } from "@/hooks/useProfiles"
import { useUsers } from "@/hooks/useUsers"
import { useLang } from "@/lib/lang-context"
import { t } from "@/lib/i18n"
import { PORTALS, getPortalById } from "@/lib/portals"
import pb from "@/lib/pb"
import { sendCredentialsEmail } from "@/lib/send-credentials-email"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DateInput } from "@/components/ui/date-input"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { UserPlus, Link2, Mail, KeyRound } from "lucide-react"

const OTHER_VALUE = "other"

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

export default function AdminNewCasePage() {
  const router = useRouter()
  const { lang } = useLang()
  const { addProfile } = useProfiles()
  const { users } = useUsers()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    date_of_birth: "",
    gender: "" as "male" | "female" | "",
    grade: "",
    notes: "",
  })

  const [paymentAmount, setPaymentAmount] = useState("")

  const [portalService, setPortalService] = useState({
    categoryId: "",
    subCategoryId: "",
    customCategory: "",
    customSubCategory: "",
  })

  const [userLinkMode, setUserLinkMode] = useState<"existing" | "new">(
    "existing"
  )
  const [existingUserId, setExistingUserId] = useState("")
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
  })

  const [result, setResult] = useState<{
    caseId: string
    caseName: string
    user?: { name: string; email: string; password: string }
    emailSent: boolean
    emailError?: string
  } | null>(null)

  const linkableUsers = users.filter(
    (u) => !["admin", "super_admin", "expert"].includes(u.role)
  )

  const handleServiceTypeChange = (value: string) => {
    setPortalService({
      categoryId: value,
      subCategoryId: "",
      customCategory: "",
      customSubCategory: "",
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!portalService.categoryId) {
      setFormError(
        t({ en: "Service type is required.", ar: "نوع الخدمة مطلوب." }, lang)
      )
      return
    }
    if (portalService.categoryId === OTHER_VALUE && !portalService.customCategory) {
      setFormError(
        t({ en: "Custom issue type is required.", ar: "اسم نوع المشكلة المخصص مطلوب." }, lang)
      )
      return
    }
    if (portalService.categoryId !== OTHER_VALUE && !portalService.subCategoryId) {
      setFormError(
        t({ en: "Case type is required.", ar: "نوع الحالة مطلوب." }, lang)
      )
      return
    }
    if (portalService.subCategoryId === OTHER_VALUE && !portalService.customSubCategory) {
      setFormError(
        t({ en: "Custom case type is required.", ar: "اسم نوع الحالة المخصص مطلوب." }, lang)
      )
      return
    }

    if (userLinkMode === "new") {
      const hasAnyNewUserField =
        newUser.name.trim() !== "" ||
        newUser.email.trim() !== "" ||
        newUser.password !== ""
      if (hasAnyNewUserField) {
        if (!newUser.name.trim() || !newUser.email.trim() || !newUser.password) {
          setFormError(
            t(
              {
                en: "Fill in all of the new user's fields, or leave them empty to skip.",
                ar: "أدخل جميع حقول المستخدم الجديد، أو اتركها فارغة للتخطي.",
              },
              lang
            )
          )
          return
        }
        if (newUser.password.length < 8) {
          setFormError(
            t(
              { en: "Password must be at least 8 characters.", ar: "يجب أن تكون كلمة المرور 8 أحرف على الأقل." },
              lang
            )
          )
          return
        }
      }
    }

    setIsSubmitting(true)
    try {
      let userId = existingUserId
      let createdUser: { name: string; email: string; password: string } | undefined

      const shouldCreateUser =
        userLinkMode === "new" && newUser.email.trim() !== ""

      if (shouldCreateUser) {
        const record = await pb.collection("users").create({
          email: newUser.email.toLowerCase(),
          password: newUser.password,
          passwordConfirm: newUser.password,
          name: newUser.name,
          role: "user",
          contact_number: "",
          is_active: true,
          emailVisibility: true,
        })
        userId = record.id
        createdUser = {
          name: newUser.name,
          email: newUser.email.toLowerCase(),
          password: newUser.password,
        }
      }

      const caseName =
        formData.name ||
        (lang === "ar" ? "حالة جديدة" : "New Case")

      const hasAmount = paymentAmount.trim() !== ""
      const amount = hasAmount ? Number(paymentAmount) : undefined

      const caseId = await addProfile(
        {
          name: caseName,
          date_of_birth: formData.date_of_birth || undefined,
          gender: formData.gender || undefined,
          grade: formData.grade,
          notes: formData.notes,
          portal_type: portalService.categoryId,
          service_type:
            portalService.subCategoryId === OTHER_VALUE
              ? portalService.customSubCategory
              : portalService.subCategoryId,
          status: hasAmount ? "awaiting_payment" : "pending",
          payment_amount: amount,
          case_details: {
            custom_category:
              portalService.categoryId === OTHER_VALUE
                ? portalService.customCategory
                : undefined,
            custom_sub_category:
              portalService.subCategoryId === OTHER_VALUE
                ? portalService.customSubCategory
                : undefined,
          },
        },
        userId
      )

      if (!hasAmount) {
        fetch("/api/telegram-notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: [
              "*New Case Needs Payment Amount*",
              "",
              `*Case:* ${caseName}`,
              `*Created by:* admin`,
              `*Service:* ${portalService.subCategoryId || portalService.categoryId || "-"}`,
            ].join("\n"),
          }),
        }).catch(() => {})
      }

      let emailSent = false
      let emailError: string | undefined
      if (createdUser) {
        try {
          await sendCredentialsEmail({
            email: createdUser.email,
            name: createdUser.name,
            password: createdUser.password,
            caseName,
            caseUrl: `${window.location.origin}/dashboard/cases/${caseId}`,
          })
          emailSent = true
        } catch (error) {
          emailError =
            error instanceof Error ? error.message : "Failed to send email"
        }
      }

      setResult({ caseId, caseName, user: createdUser, emailSent, emailError })
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : t(
              { en: "Failed to create case. Please try again.", ar: "فشل إنشاء الحالة. حاول مرة أخرى." },
              lang
            )
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (result) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {t({ en: "Case created", ar: "تم إنشاء الحالة" }, lang)}
            </CardTitle>
            <CardDescription>
              {t(
                { en: "The case has been created and linked to a user.", ar: "تم إنشاء الحالة وربطها بمستخدم." },
                lang
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between rounded-lg border p-4">
              <span className="text-muted-foreground">
                {t({ en: "Case", ar: "الحالة" }, lang)}
              </span>
              <span className="font-medium">{result.caseName}</span>
            </div>
            {result.user && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <p className="mb-3 flex items-center gap-2 font-medium text-green-800">
                  <UserPlus className="h-4 w-4" />
                  {t(
                    { en: "New user account created", ar: "تم إنشاء حساب المستخدم" },
                    lang
                  )}
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {t({ en: "Email", ar: "البريد الإلكتروني" }, lang)}:
                    </span>
                    <span className="font-medium">{result.user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {t({ en: "Password", ar: "كلمة المرور" }, lang)}:
                    </span>
                    <span className="font-medium">{result.user.password}</span>
                  </div>
                </div>
                {result.emailSent ? (
                  <p className="mt-3 text-sm text-green-700">
                    {t(
                      { en: "Credentials were emailed to the user.", ar: "تم إرسال بيانات الدخول إلى بريد المستخدم." },
                      lang
                    )}
                  </p>
                ) : (
                  <p className="mt-3 text-sm text-amber-700">
                    {t(
                      { en: "Email could not be sent", ar: "تعذر إرسال البريد الإلكتروني" },
                      lang
                    )}
                    {result.emailError ? `: ${result.emailError}` : ""} —{" "}
                    {t(
                      { en: "share these credentials with the user manually.", ar: "شارك بيانات الدخول مع المستخدم يدويًا." },
                      lang
                    )}
                  </p>
                )}
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => router.push("/dashboard/admin/cases")}>
                {t({ en: "Back to Cases", ar: "العودة إلى الحالات" }, lang)}
              </Button>
              <Button onClick={() => router.push(`/dashboard/admin/cases/${result.caseId}`)}>
                {t({ en: "View Case", ar: "عرض الحالة" }, lang)}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">
          {t({ en: "Create New Case", ar: "إنشاء حالة جديدة" }, lang)}
        </h1>
        <p className="text-muted-foreground">
          {t(
            { en: "Create a case and link it to a user", ar: "أنشئ حالة واربطها بمستخدم" },
            lang
          )}
        </p>
      </div>

      {formError && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {t({ en: "Case Information", ar: "معلومات الحالة" }, lang)}
            </CardTitle>
            <CardDescription>
              {t(
                { en: "Basic details about the case", ar: "التفاصيل الأساسية حول الحالة" },
                lang
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                {t({ en: "Case Name", ar: "اسم الحالة" }, lang)}
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">
                  {t({ en: "Date of Birth", ar: "تاريخ الميلاد" }, lang)}
                </Label>
                <DateInput
                  id="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={(v) =>
                    setFormData({ ...formData, date_of_birth: v })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">
                  {t({ en: "Gender", ar: "الجنس" }, lang)}
                </Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      gender: value as "male" | "female",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t(
                        { en: "Select gender", ar: "اختر الجنس" },
                        lang
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">
                      {t({ en: "Male", ar: "ذكر" }, lang)}
                    </SelectItem>
                    <SelectItem value="female">
                      {t({ en: "Female", ar: "أنثى" }, lang)}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="grade">
                {t({ en: "Grade", ar: "الصف الدراسي" }, lang)}
              </Label>
              <Select
                value={formData.grade}
                onValueChange={(value) =>
                  setFormData({ ...formData, grade: value })
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t(
                      { en: "Select grade", ar: "اختر الصف" },
                      lang
                    )}
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
              <Label htmlFor="payment_amount">
                {t({ en: "Payment Amount (optional)", ar: "مبلغ الدفع (اختياري)" }, lang)}
              </Label>
              <Input
                id="payment_amount"
                type="number"
                min="0"
                step="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder={t(
                  { en: "Enter amount", ar: "أدخل المبلغ" },
                  lang
                )}
              />
              <p className="text-xs text-muted-foreground">
                {t(
                  {
                    en: "If left empty, the case stays in 'awaiting payment' status until you set the amount from the Payments page.",
                    ar: "إذا تُرك فارغًا، تبقى الحالة في انتظار تحديد المبلغ من صفحة المدفوعات.",
                  },
                  lang
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {t({ en: "Service Type", ar: "نوع الخدمة" }, lang)}
            </CardTitle>
            <CardDescription>
              {t(
                { en: "Select the service this case belongs to", ar: "اختر الخدمة التي تنتمي إليها هذه الحالة" },
                lang
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>
                {t({ en: "Service Type", ar: "نوع الخدمة" }, lang)}
                <span className="text-red-500 ms-1">*</span>
              </Label>
              <Select
                value={portalService.categoryId}
                onValueChange={handleServiceTypeChange}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t(
                      { en: "Select service type", ar: "اختر نوع الخدمة" },
                      lang
                    )}
                  />
                </SelectTrigger>
                <SelectContent>
                  {PORTALS.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {lang === "ar"
                        ? p.portalName.ar.replace(/^بوابة /, "")
                        : p.title.en}
                    </SelectItem>
                  ))}
                  <SelectItem value={OTHER_VALUE}>
                    {t({ en: "Other", ar: "أخرى" }, lang)}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {portalService.categoryId === OTHER_VALUE && (
              <div className="space-y-2">
                <Label>
                  {t(
                    { en: "Custom issue type", ar: "اسم نوع المشكلة المخصص" },
                    lang
                  )}
                  <span className="text-red-500 ms-1">*</span>
                </Label>
                <Input
                  value={portalService.customCategory}
                  onChange={(e) =>
                    setPortalService({
                      ...portalService,
                      customCategory: e.target.value,
                    })
                  }
                  placeholder={t(
                    { en: "Enter issue type", ar: "أدخل اسم نوع المشكلة" },
                    lang
                  )}
                />
              </div>
            )}

            {portalService.categoryId &&
              portalService.categoryId !== OTHER_VALUE && (
                <div className="space-y-2">
                  <Label>
                    {t({ en: "Case Type", ar: "نوع الحالة" }, lang)}
                    <span className="text-red-500 ms-1">*</span>
                  </Label>
                  <Select
                    value={portalService.subCategoryId}
                    onValueChange={(value) =>
                      setPortalService({
                        ...portalService,
                        subCategoryId: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t(
                          { en: "Select case type", ar: "اختر نوع الحالة" },
                          lang
                        )}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {getPortalById(portalService.categoryId)?.services.map(
                        (s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {t(s.name, lang)}
                          </SelectItem>
                        )
                      )}
                      <SelectItem value={OTHER_VALUE}>
                        {t({ en: "Other", ar: "أخرى" }, lang)}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

            {portalService.subCategoryId === OTHER_VALUE && (
              <div className="space-y-2">
                <Label>
                  {t(
                    { en: "Custom case type", ar: "اسم نوع الحالة المخصص" },
                    lang
                  )}
                  <span className="text-red-500 ms-1">*</span>
                </Label>
                <Input
                  value={portalService.customSubCategory}
                  onChange={(e) =>
                    setPortalService({
                      ...portalService,
                      customSubCategory: e.target.value,
                    })
                  }
                  placeholder={t(
                    { en: "Enter case type", ar: "أدخل اسم نوع الحالة" },
                    lang
                  )}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              {t({ en: "Link to User", ar: "ربط بمستخدم" }, lang)}
            </CardTitle>
            <CardDescription>
              {t(
                {
                  en: "Optional — assign this case to a registered user, or create a new account for the user. You can link a user later from the case page.",
                  ar: "اختياري — خصص هذه الحالة لمستخدم مسجل، أو أنشئ حسابًا جديدًا للمستخدم. يمكنك ربط مستخدم لاحقًا من صفحة الحالة.",
                },
                lang
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={userLinkMode === "existing" ? "default" : "outline"}
                onClick={() => setUserLinkMode("existing")}
              >
                <Link2 className="me-2 h-4 w-4" />
                {t({ en: "Existing User", ar: "مستخدم مسجل" }, lang)}
              </Button>
              <Button
                type="button"
                variant={userLinkMode === "new" ? "default" : "outline"}
                onClick={() => setUserLinkMode("new")}
              >
                <UserPlus className="me-2 h-4 w-4" />
                {t({ en: "New User", ar: "مستخدم جديد" }, lang)}
              </Button>
            </div>

            {userLinkMode === "existing" ? (
              <div className="space-y-2">
                <Label>
                  {t({ en: "User", ar: "المستخدم" }, lang)}
                </Label>
                <Select
                  value={existingUserId}
                  onValueChange={setExistingUserId}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t(
                        { en: "Select a user", ar: "اختر مستخدمًا" },
                        lang
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {linkableUsers.length === 0 ? (
                      <SelectItem value="__none__" disabled>
                        {t(
                          { en: "No users available", ar: "لا يوجد مستخدمون" },
                          lang
                        )}
                      </SelectItem>
                    ) : (
                      linkableUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-4 rounded-lg border p-4">
                <div className="space-y-2">
                  <Label htmlFor="new_user_name">
                    {t({ en: "Full Name", ar: "الاسم الكامل" }, lang)}
                  </Label>
                  <Input
                    id="new_user_name"
                    value={newUser.name}
                    onChange={(e) =>
                      setNewUser({ ...newUser, name: e.target.value })
                    }
                    placeholder={t(
                      { en: "Enter full name", ar: "أدخل الاسم الكامل" },
                      lang
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new_user_email">
                    {t({ en: "Email", ar: "البريد الإلكتروني" }, lang)}
                  </Label>
                  <Input
                    id="new_user_email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    placeholder={t(
                      { en: "Enter email address", ar: "أدخل عنوان البريد الإلكتروني" },
                      lang
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new_user_password">
                    {t({ en: "Password", ar: "كلمة المرور" }, lang)}
                  </Label>
                  <Input
                    id="new_user_password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                    placeholder={t(
                      { en: "Min 8 characters", ar: "8 أحرف على الأقل" },
                      lang
                    )}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t(
                      {
                        en: "The user will log in with this email and password, and the credentials are emailed after creation. Leave these fields empty to create the case without an account.",
                        ar: "سيسجل المستخدم الدخول بهذا البريد وكلمة المرور، وسيتم إرسال بيانات الدخول عبر البريد الإلكتروني بعد الإنشاء. اترك هذه الحقول فارغة لإنشاء الحالة بدون حساب.",
                      },
                      lang
                    )}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {t({ en: "Explain more", ar: "اشرح أكثر" }, lang)}
            </CardTitle>
            <CardDescription>
              {t(
                {
                  en: "Add any extra context that will help us handle this case",
                  ar: "أضف أي سياق إضافي يساعدنا في التعامل مع هذه الحالة",
                },
                lang
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder={t(
                {
                  en: "Provide more details about the case...",
                  ar: "قدم مزيداً من التفاصيل حول الحالة...",
                },
                lang
              )}
              rows={4}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            {t({ en: "Cancel", ar: "إلغاء" }, lang)}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? t({ en: "Creating...", ar: "جارٍ الإنشاء..." }, lang)
              : t({ en: "Create Case", ar: "إنشاء الحالة" }, lang)}
          </Button>
        </div>
      </form>
    </div>
  )
}
