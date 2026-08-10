"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useProfiles } from "@/hooks/useProfiles"
import { usePaymentSettings } from "@/hooks/usePaymentSettings"
import { useLang } from "@/lib/lang-context"
import { formatAmount, paymentStatusLabels } from "@/lib/payment"
import { formatDate } from "@/lib/format-date"
import type { CasePaymentStatus } from "@/types/profile"
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
import { SkeletonTable } from "@/components/ui/skeleton"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CaseStatusBadge } from "@/components/cases/status-badge"
import {
  Wallet,
  CheckCircle2,
  XCircle,
  Save,
  Loader2,
  FileText,
} from "lucide-react"
import pb from "@/lib/pb"

const QUEUE_TABS: { value: string; statuses: CasePaymentStatus[] }[] = [
  { value: "all", statuses: ["pending", "awaiting_payment", "under_review"] },
  { value: "pending", statuses: ["pending"] },
  { value: "awaiting_payment", statuses: ["awaiting_payment"] },
  { value: "under_review", statuses: ["under_review"] },
  {value: "active", statuses:["active"]}
]

export default function AdminPaymentsPage() {
  const { lang } = useLang()
  const {
    profiles,
    isLoading,
    setPaymentAmount,
    approveCase,
    rejectPayment,
  } = useProfiles()
  const { bankDetails } = usePaymentSettings()

  const [activeTab, setActiveTab] = useState("all")
  const [amountInputs, setAmountInputs] = useState<Record<string, string>>({})
  const [rejectInputs, setRejectInputs] = useState<Record<string, string>>({})
  const [busyId, setBusyId] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const queuedCases = useMemo(
    () => profiles.filter((p) => p.status ),
    [profiles]
  )

  const visibleCases = useMemo(() => {
    const tab = QUEUE_TABS.find((t) => t.value === activeTab) || QUEUE_TABS[0]
    return queuedCases.filter((p) => tab.statuses.includes(p.status as CasePaymentStatus))
  }, [queuedCases, activeTab])

  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    QUEUE_TABS.forEach((t) => {
      c[t.value] = queuedCases.filter((p) =>
        t.statuses.includes(p.status as CasePaymentStatus)
      ).length
    })
    return c
  }, [queuedCases])

  const getSlipUrl = (profileId: string, slip: string) =>
    pb.files.getURL({ collectionId: "cases", id: profileId }, slip)

  const runAction = async (fn: () => Promise<unknown>, id: string) => {
    setBusyId(id)
    setErrorMsg(null)
    try {
      await fn()
    } catch (error) {
      setErrorMsg(
        error instanceof Error
          ? error.message
          : lang === "ar"
            ? "فشل تنفيذ الإجراء."
            : "Action failed."
      )
    } finally {
      setBusyId(null)
    }
  }

  const handleSetAmount = (caseId: string) => {
    const value = amountInputs[caseId]
    if (!value || Number(value) <= 0) return
    runAction(
      () => setPaymentAmount(caseId, Number(value)),
      caseId
    ).then(() => {
      setAmountInputs((prev) => ({ ...prev, [caseId]: "" }))
    })
  }

  const handleReject = (caseId: string) => {
    const reason = rejectInputs[caseId]
    runAction(() => rejectPayment(caseId, reason), caseId).then(() => {
      setRejectInputs((prev) => ({ ...prev, [caseId]: "" }))
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">
            {lang === "ar" ? "المدفوعات" : "Payments"}
          </h1>
          <p className="text-muted-foreground">
            {lang === "ar"
              ? "إدارة مدفوعات الحالات"
              : "Manage case payments"}
          </p>
        </div>
        <SkeletonTable rows={6} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">
          {lang === "ar" ? "المدفوعات" : "Payments"}
        </h1>
        <p className="text-muted-foreground">
          {lang === "ar"
            ? "حدد المبالغ، راجع الإيصالات، وفعّل الحالات"
            : "Set amounts, review receipts, and enable cases"}
        </p>
      </div>

      {errorMsg && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      {queuedCases.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wallet className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-medium">
              {lang === "ar"
                ? "لا توجد حالات بانتظار الدفع"
                : "No cases waiting for payment"}
            </h3>
            <p className="text-center text-muted-foreground">
              {lang === "ar"
                ? "جميع الحالات مفعلة"
                : "All cases are active"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            {QUEUE_TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.value === "all"
                  ? lang === "ar"
                    ? "الكل"
                    : "All"
                  : paymentStatusLabels[t.statuses[0]][lang]}
                <Badge variant="secondary" className="ms-2">
                  {counts[t.value]}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTab}>
            <Card>
              <CardHeader>
                <CardTitle>
                  {lang === "ar" ? "قائمة الانتظار" : "Queue"}
                </CardTitle>
                <CardDescription>
                  {lang === "ar"
                    ? `${visibleCases.length} حالة`
                    : `${visibleCases.length} case(s)`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {visibleCases.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    {lang === "ar"
                      ? "لا توجد حالات في هذه الفئة"
                      : "No cases in this category"}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          {lang === "ar" ? "الحالة" : "Case"}
                        </TableHead>
                        <TableHead>
                          {lang === "ar" ? "المستخدم" : "User"}
                        </TableHead>
                        <TableHead>
                          {lang === "ar" ? "الحالة" : "Status"}
                        </TableHead>
                        <TableHead>
                          {lang === "ar" ? "المبلغ" : "Amount"}
                        </TableHead>
                        <TableHead>
                          {lang === "ar" ? "تاريخ الإنشاء" : "Created"}
                        </TableHead>
                        <TableHead className="text-right">
                          {lang === "ar" ? "الإجراءات" : "Actions"}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visibleCases.map((profile) => (
                        <TableRow key={profile.id}>
                          <TableCell className="font-medium">
                            <Link
                              href={`/dashboard/admin/cases/${profile.id}`}
                              className="hover:underline"
                            >
                              {profile.name}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {profile.expand?.user
                                ? `${profile.expand.user.name} (${profile.expand.user.email})`
                                : "—"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <CaseStatusBadge status={profile.status} />
                          </TableCell>
                          <TableCell>
                            {profile.payment_amount !== undefined &&
                            profile.payment_amount !== null
                              ? formatAmount(
                                  profile.payment_amount,
                                  bankDetails.currency
                                )
                              : "—"}
                          </TableCell>
                          <TableCell>
                            {formatDate(profile.created)}
                          </TableCell>
                          <TableCell className="text-right">
                            {profile.status === "pending" && (
                              <div className="flex flex-col items-end gap-2">
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={amountInputs[profile.id] || ""}
                                    onChange={(e) =>
                                      setAmountInputs((prev) => ({
                                        ...prev,
                                        [profile.id]: e.target.value,
                                      }))
                                    }
                                    placeholder={
                                      lang === "ar"
                                        ? "المبلغ"
                                        : "Amount"
                                    }
                                    className="w-32"
                                  />
                                  <Button
                                    size="sm"
                                    disabled={
                                      busyId === profile.id ||
                                      !amountInputs[profile.id] ||
                                      Number(amountInputs[profile.id]) <= 0
                                    }
                                    onClick={() =>
                                      handleSetAmount(profile.id)
                                    }
                                  >
                                    {busyId === profile.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Save className="me-1 h-4 w-4" />
                                    )}
                                    {lang === "ar" ? "تحديد" : "Set"}
                                  </Button>
                                </div>
                              </div>
                            )}

                            {profile.status === "awaiting_payment" && (
                              <div className="flex flex-col items-end gap-2">
                                <span className="text-sm text-muted-foreground">
                                  {lang === "ar"
                                    ? "بانتظار الإيصال من المستخدم"
                                    : "Waiting for user receipt"}
                                </span>
                                {profile.payment_reject_reason && (
                                  <span className="text-xs text-red-600">
                                    {lang === "ar" ? "الرفض:" : "Rejected:"}{" "}
                                    {profile.payment_reject_reason}
                                  </span>
                                )}
                              </div>
                            )}

                            {profile.status === "under_review" && (
                              <div className="flex flex-col items-end gap-2">
                                {profile.payment_slip && (
                                  <a
                                    href={getSlipUrl(
                                      profile.id,
                                      profile.payment_slip
                                    )}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    <Button variant="outline" size="sm">
                                      <FileText className="me-1 h-4 w-4" />
                                      {lang === "ar"
                                        ? "عرض الإيصال"
                                        : "View Receipt"}
                                    </Button>
                                  </a>
                                )}
                                <div className="flex items-center gap-2">
                                  <Input
                                    value={rejectInputs[profile.id] || ""}
                                    onChange={(e) =>
                                      setRejectInputs((prev) => ({
                                        ...prev,
                                        [profile.id]: e.target.value,
                                      }))
                                    }
                                    placeholder={
                                      lang === "ar"
                                        ? "سبب الرفض (اختياري)"
                                        : "Reject reason (optional)"
                                    }
                                    className="w-40"
                                  />
                                  <Button
                                    size="sm"
                                    disabled={busyId === profile.id}
                                    onClick={() =>
                                      runAction(
                                        () =>
                                          approveCase(profile.id),
                                        profile.id
                                      )
                                    }
                                  >
                                    {busyId === profile.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <CheckCircle2 className="me-1 h-4 w-4" />
                                    )}
                                    {lang === "ar" ? "تفعيل" : "Enable"}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    disabled={busyId === profile.id}
                                    onClick={() =>
                                      handleReject(profile.id)
                                    }
                                  >
                                    <XCircle className="me-1 h-4 w-4" />
                                    {lang === "ar" ? "رفض" : "Reject"}
                                  </Button>
                                </div>
                              </div>
                            )}
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
      )}
    </div>
  )
}
