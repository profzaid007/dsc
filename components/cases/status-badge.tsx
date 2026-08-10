"use client"

import { Badge } from "@/components/ui/badge"
import { useLang } from "@/lib/lang-context"
import type { CasePaymentStatus } from "@/types/profile"
import { paymentStatusLabels } from "@/lib/payment"

const statusClasses: Record<CasePaymentStatus, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  awaiting_payment: "bg-orange-50 text-orange-700",
  under_review: "bg-blue-50 text-blue-700",
  active: "bg-green-50 text-green-700",
}

export function CaseStatusBadge({
  status,
}: {
  status?: CasePaymentStatus
}) {
  const { lang } = useLang()
  if (!status || !paymentStatusLabels[status]) return null
  return (
    <Badge variant="outline" className={statusClasses[status]}>
      {paymentStatusLabels[status][lang]}
    </Badge>
  )
}
