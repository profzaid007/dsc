"use client"
import { toStringList as toList } from "@/lib/expert-list-fields"
import { useUiTranslation } from "@/hooks/useUiTranslation"
import { boundedFullList } from "@/lib/bounded-records"
import { usePermissions } from "@/hooks/usePermissions"
import { ProtectedFileLink } from "@/components/ProtectedFileLink"

import { useState, useEffect } from "react"
import { useUsers } from "@/hooks/useUsers"
import pb, { getErrorMessage } from "@/lib/pb"
import type { RecordModel } from "pocketbase"
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SkeletonTable } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  UserCheck,
  Mail,
  Phone,
  CalendarClock,
  CheckCircle2,
  Paperclip,
  MessageSquareText,
  Eye,
  User as UserIcon,
  MapPin,
  Globe,
  GraduationCap,
  Briefcase,
  Languages,
  Wallet,
  Clock,
  BookOpen,
  Image as ImageIcon,
} from "lucide-react"
import type { User } from "@/types/user"
import { formatDateTime } from "@/lib/format-date"
import { LANGUAGES } from "@/lib/language-list"
import { useLang } from "@/lib/lang-context"
import { t } from "@/lib/i18n"
import { ExpertBankDetails } from "./ExpertBankDetails"

function humanize(value: string): string {
  return value
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function toFileList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter(
      (v): v is string => typeof v === "string" && v.length > 0
    )
  }
  if (typeof value === "string" && value.trim()) {
    return [value]
  }
  return []
}

function toText(value: unknown): string {
  if (typeof value === "string") return value
  if (typeof value === "number") return String(value)
  return ""
}

function languageLabel(value: string): string {
  const found = LANGUAGES.find((l) => l.value === value)
  return found ? found.label.en : humanize(value)
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-muted-foreground">{label}</p>
        <div className="font-medium break-words">{value || "—"}</div>
      </div>
    </div>
  )
}

function TagList({ values }: { values: string[] }) {
  if (values.length === 0) {
    return <span className="font-medium">—</span>
  }
  return (
    <div className="flex flex-wrap gap-1">
      {values.map((value) => (
        <Badge key={value} variant="secondary" className="font-normal">
          {humanize(value)}
        </Badge>
      ))}
    </div>
  )
}

export function ExpertApprovalPage() {
  const ui = useUiTranslation()

  const access = usePermissions()
  const { users, isLoading, updateUser, refresh } = useUsers(
    access.can("experts.read")
  )
  const { lang } = useLang()
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState("")
  const [fileToken, setFileToken] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedProfile, setSelectedProfile] = useState<RecordModel | null>(
    null
  )
  const [profileLoading, setProfileLoading] = useState(false)
  const [submittedUsers, setSubmittedUsers] = useState<Set<string> | null>(null)
  const [submissionError, setSubmissionError] = useState("")
  useEffect(() => {
    if (!access.can("experts.read")) return
    let active = true
    void boundedFullList(pb.collection("expert_profiles"), {fields:"id,user", requestKey:null})
      .then(profiles => { if (active) {setSubmittedUsers(new Set(profiles.map(p => String(p.user)))); setSubmissionError("")} })
      .catch(error => { if (active) setSubmissionError(getErrorMessage(error, lang)) })
    return () => {active = false}
  }, [users, lang, access.isLoading]) // eslint-disable-line react-hooks/exhaustive-deps


  useEffect(() => {
    let cancelled = false
    pb.files
      .getToken()
      .then((token) => {
        if (!cancelled) setFileToken(token)
      })
      .catch(() => {
        if (!cancelled) setFileToken("")
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!selectedUser) {
      return
    }
    let cancelled = false
    // Loading flags are intentionally reset when selecting a new application.
    setProfileLoading(true)
    pb.collection("expert_profiles")
      .getFirstListItem(
        pb.filter("user = {:value0}", { value0: selectedUser.id })
      )
      .then((record) => {
        if (!cancelled) setSelectedProfile(record)
      })
      .catch(() => {
        if (!cancelled) setSelectedProfile(null)
      })
      .finally(() => {
        if (!cancelled) setProfileLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [selectedUser])

  const pendingExperts = users.filter(
    (u) => u.role === "expert" && !u.is_active && submittedUsers?.has(u.id)
  )

  const getFileUrl = (record: RecordModel, filename: string) => {
    return pb.files.getURL(
      record,
      filename,
      fileToken ? { token: fileToken } : {}
    )
  }

  const handleApprove = async (user: (typeof users)[number]) => {
    setApprovingId(user.id)
    setActionError("")
    let stage: "profile" | "approval" | "email" | "refresh" = "profile"
    let approved = false
    try {
      // Recheck before approval so a stale list cannot approve a failed attempt.
      await pb.collection("expert_profiles").getFirstListItem(pb.filter("user = {:id}", {id:user.id}), {requestKey:null})
      stage = "approval"
      await updateUser(user.id, { is_active: true })
      approved = true
      stage = "email"

      const loginUrl = `${window.location.origin}/login`
      const approvalEmailTitle =
        lang === "ar"
          ? "تم اعتماد حسابك كخبير"
          : "Your Expert Account Has Been Approved"
      const html = [
        `<h2>${approvalEmailTitle}</h2>`,
        `<p>${
          lang === "ar" ? `مرحباً ${user.name}،` : `Dear ${user.name},`
        }</p>`,
        `<p>${
          lang === "ar"
            ? "تهانينا! تم اعتماد حسابك كخبير لدى <strong>DSC</strong>."
            : "Congratulations! Your expert account at <strong>DSC</strong> has been approved."
        }</p>`,
        `<p>${
          lang === "ar"
            ? "يمكنك الآن تسجيل الدخول باستخدام البريد الإلكتروني وكلمة المرور اللذين أدخلتهما عند التسجيل:"
            : "You can now log in using the email and password you provided at registration:"
        }</p>`,
        `<p><a href="${loginUrl}">${loginUrl}</a></p>`,
      ].join("\n")

      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${pb.authStore.token}`,
        },
        body: JSON.stringify({
          from: "admin@dsc.ac",
          to: user.email,
          subject: approvalEmailTitle,
          html,
        }),
      })

      if (!response.ok) {
        const { error: errMsg } = await response.json()
        throw new Error(
          errMsg ||
            t(
              {
                en: "Failed to send approval email",
                ar: "تعذّر إرسال بريد الاعتماد",
              },
              lang
            )
        )
      }

      stage = "refresh"
      await refresh()
      setSelectedUser(null)
    } catch (err) {
      const message = getErrorMessage(err, lang)
      const status = (err as {status?:number})?.status
      if (approved) {
        setActionError(lang === "ar"
          ? `تم اعتماد الحساب، لكن ${stage === "email" ? "تعذر إرسال بريد الإشعار" : "تعذر تحديث القائمة"}. ${message}`
          : `The account was approved, but ${stage === "email" ? "the notification email could not be sent" : "the list could not be refreshed"}. ${message}`)
      } else if (stage === "profile" && status === 404) {
        setActionError(lang === "ar"
          ? "لم يُعثر على ملف طلب الخبير. لم يتم اعتماد الحساب؛ تحقق من اكتمال طلبه."
          : "No submitted application profile was found for this expert. The account was not approved; check that the application is complete.")
      } else {
        setActionError(lang === "ar" ? `تعذر اعتماد حساب الخبير. ${message}` : `Expert approval failed. ${message}`)
      }
      try { await refresh() } catch { /* Preserve the original action error. */ }
    } finally {
      setApprovingId(null)
    }
  }

  const profilePhotoUrl =
    selectedProfile && toText(selectedProfile.profile_photo)
      ? getFileUrl(selectedProfile, toText(selectedProfile.profile_photo))
      : ""

  const cvFiles = selectedProfile ? toFileList(selectedProfile.cv) : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">
          {lang === "ar" ? "اعتماد الخبراء" : "Expert Approval"}
        </h1>
        <p className="text-muted-foreground">
          {lang === "ar"
            ? "مراجعة واعتماد طلبات الخبراء"
            : "Review and approve expert applications"}
        </p>
      </div>

      {(actionError || submissionError) && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {actionError || submissionError}
        </div>
      )}

      {isLoading || (!submittedUsers && !submissionError) ? (
        <SkeletonTable rows={5} />
      ) : pendingExperts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle2 className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-medium">
              {ui("No pending applications")}
            </h3>
            <p className="text-center text-muted-foreground">
              {ui("There are no expert applications waiting for approval.")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{ui("Pending Expert Applications")}</CardTitle>
            <CardDescription>
              {pendingExperts.length} {ui("application(s) awaiting approval")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[220px]">{ui("Name")}</TableHead>
                  <TableHead>{ui("Email")}</TableHead>
                  <TableHead>{ui("Contact Number")}</TableHead>
                  <TableHead>{ui("Applied On")}</TableHead>
                  <TableHead>{ui("Status")}</TableHead>
                  <TableHead className="text-end">{ui("Actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingExperts.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                        {user.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        {user.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        {user.contact_number || "—"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" />
                        {formatDateTime(user.created)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="bg-amber-50 text-amber-700"
                      >
                        {ui("Pending")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedUser(user)}
                        >
                          <Eye className="me-1 h-4 w-4" />
                          {ui("View")}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(user)}
                          disabled={
                            approvingId === user.id ||
                            !access.can("experts.approve")
                          }
                        >
                          {approvingId === user.id
                            ? ui("Approving...")
                            : ui("Approve & Notify")}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog
        open={!!selectedUser}
        onOpenChange={(open) => {
          if (!open) setSelectedUser(null)
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
          {selectedUser && (
            <>
              {access.can("payments.read") && (
                <ExpertBankDetails
                  key={selectedUser.id}
                  userId={selectedUser.id}
                />
              )}
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  {profilePhotoUrl ? (
                    <a
                      href={profilePhotoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={profilePhotoUrl}
                        alt={selectedUser.name}
                        className="h-14 w-14 rounded-full border object-cover"
                      />
                    </a>
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border bg-muted">
                      <UserIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <span className="flex items-center gap-2">
                    {selectedUser.name}
                    <Badge
                      variant="outline"
                      className="bg-amber-50 text-amber-700"
                    >
                      {ui("Pending")}
                    </Badge>
                  </span>
                </DialogTitle>
                <DialogDescription>
                  {ui("Expert application submitted on")}{" "}
                  {formatDateTime(selectedUser.created)}
                </DialogDescription>
              </DialogHeader>

              {profileLoading ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  {ui("Loading profile details...")}
                </p>
              ) : !selectedProfile ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <DetailItem
                      icon={Mail}
                      label={ui("Email")}
                      value={selectedUser.email}
                    />
                    <DetailItem
                      icon={Phone}
                      label={ui("Contact")}
                      value={selectedUser.contact_number}
                    />
                  </div>
                  <p className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                    {ui("No profile details were found for this application.")}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
                      {ui("Personal Details")}
                    </h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <DetailItem
                        icon={UserIcon}
                        label={ui("Full Legal Name")}
                        value={toText(selectedProfile.full_legal_name)}
                      />
                      <DetailItem
                        icon={Mail}
                        label={ui("Email")}
                        value={selectedUser.email}
                      />
                      <DetailItem
                        icon={Phone}
                        label={ui("Contact Number")}
                        value={selectedUser.contact_number}
                      />
                      <DetailItem
                        icon={Phone}
                        label={ui("WhatsApp")}
                        value={
                          toText(selectedProfile.whatsapp_number)
                            ? `${toText(
                                selectedProfile.whatsapp_country_code
                              )} ${toText(selectedProfile.whatsapp_number)}`
                            : ""
                        }
                      />
                      <DetailItem
                        icon={Globe}
                        label={ui("Nationality")}
                        value={toText(selectedProfile.nationality)}
                      />
                      <DetailItem
                        icon={MapPin}
                        label={ui("Country of Residence")}
                        value={toText(selectedProfile.country_of_residence)}
                      />
                      <DetailItem
                        icon={MapPin}
                        label={ui("City")}
                        value={toText(selectedProfile.city)}
                      />
                      <DetailItem
                        icon={Languages}
                        label={ui("Preferred Languages")}
                        value={
                          toList(selectedProfile.preferred_languages)
                            .map(languageLabel)
                            .join(", ") || "—"
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
                      {ui("Academic Background")}
                    </h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <DetailItem
                        icon={GraduationCap}
                        label={ui("Highest Academic Degree")}
                        value={
                          toText(selectedProfile.highest_academic_degree)
                            ? humanize(
                                toText(selectedProfile.highest_academic_degree)
                              )
                            : ""
                        }
                      />
                      <DetailItem
                        icon={BookOpen}
                        label={ui("Degree Title")}
                        value={toText(selectedProfile.degree_title)}
                      />
                      <DetailItem
                        icon={BookOpen}
                        label={ui("Field of Study")}
                        value={toText(selectedProfile.field_of_study)}
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
                      {ui("Professional Details")}
                    </h3>
                    <div className="space-y-3">
                      <DetailItem
                        icon={UserCheck}
                        label={ui("Age Group")}
                        value={
                          <TagList values={toList(selectedProfile.age_group)} />
                        }
                      />
                      <DetailItem
                        icon={Briefcase}
                        label={ui("Specialization")}
                        value={
                          <TagList
                            values={toList(selectedProfile.specialization_type)}
                          />
                        }
                      />
                      <DetailItem
                        icon={UserCheck}
                        label={ui("Client Type")}
                        value={
                          <TagList
                            values={toList(selectedProfile.client_type)}
                          />
                        }
                      />
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <DetailItem
                          icon={Globe}
                          label={ui("Consultation Mode")}
                          value={
                            toText(selectedProfile.consultation_mode)
                              ? humanize(
                                  toText(selectedProfile.consultation_mode)
                                )
                              : ""
                          }
                        />
                        <DetailItem
                          icon={Wallet}
                          label={ui("Fee")}
                          value={toText(selectedProfile.fee)}
                        />
                        <DetailItem
                          icon={Clock}
                          label={ui("Availability")}
                          value={toText(selectedProfile.availability)}
                        />
                      </div>
                    </div>
                  </div>

                  {toText(selectedProfile.bio) && (
                    <div>
                      <div className="mb-1 flex items-center gap-1.5 text-sm font-medium">
                        <MessageSquareText className="h-4 w-4 text-muted-foreground" />
                        {ui("Message")}
                      </div>
                      <p className="rounded-lg bg-muted/50 p-3 text-sm whitespace-pre-wrap">
                        {toText(selectedProfile.bio)}
                      </p>
                    </div>
                  )}

                  <div>
                    <div className="mb-1 flex items-center gap-1.5 text-sm font-medium">
                      <Paperclip className="h-4 w-4 text-muted-foreground" />
                      {ui("Attachments")}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {profilePhotoUrl && (
                        <a
                          href={profilePhotoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 rounded-lg border p-2 text-sm text-primary hover:bg-muted/50 hover:underline"
                        >
                          <ImageIcon className="h-4 w-4 shrink-0" />
                          <span className="truncate">{ui("Profile Photo")}</span>
                        </a>
                      )}
                      {cvFiles.map((filename) => (
                        <ProtectedFileLink
                          key={filename}
                          href={getFileUrl(selectedProfile, filename)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 rounded-lg border p-2 text-sm text-primary hover:bg-muted/50 hover:underline"
                        >
                          <Paperclip className="h-4 w-4 shrink-0" />
                          <span className="truncate">{filename}</span>
                        </ProtectedFileLink>
                      ))}
                      {!profilePhotoUrl && cvFiles.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                          {ui("No attachments were uploaded.")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedUser(null)}>
                  {ui("Close")}
                </Button>
                <Button
                  onClick={() => handleApprove(selectedUser)}
                  disabled={
                    approvingId === selectedUser.id ||
                    !access.can("experts.approve")
                  }
                >
                  {approvingId === selectedUser.id
                    ? ui("Approving...")
                    : ui("Approve & Notify")}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
