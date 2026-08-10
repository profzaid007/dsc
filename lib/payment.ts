import type { CasePaymentStatus } from "@/types/profile"

export type { CasePaymentStatus as PaymentStatus }

export const paymentStatusLabels: Record<
  CasePaymentStatus,
  { en: string; ar: string }
> = {
  pending: { en: "Awaiting Payment", ar: "في انتظار الدفع" },
  awaiting_payment: { en: "Payment Required", ar: "مطلوب الدفع" },
  under_review: { en: "Payment Under Review", ar: "الدفع قيد المراجعة" },
  active: { en: "Active", ar: "مفعلة" },
}

export const paymentStatusOrder: CasePaymentStatus[] = [
  "pending",
  "awaiting_payment",
  "under_review",
  "active",
]

export interface PaymentBankDetails {
  currency: string
  bank_name: string
  account_number: string
  iban: string
  beneficiary: string
}

export const DEFAULT_BANK_DETAILS: PaymentBankDetails = {
  currency: "SAR",
  bank_name: "",
  account_number: "",
  iban: "",
  beneficiary: "",
}

export function formatAmount(
  amount: number | undefined,
  currency: string
): string {
  if (amount === undefined || amount === null) return "—"
  return `${amount} ${currency}`
}
