export function paymentCaseStatus(status: string | null | undefined): string {
  return status?.trim() || "awaiting_payment"
}
