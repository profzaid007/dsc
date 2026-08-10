"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { useLang } from "@/lib/lang-context"
import { usePaymentSettings } from "@/hooks/usePaymentSettings"
import type { PaymentBankDetails } from "@/lib/payment"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Landmark, Loader2 } from "lucide-react"

export default function PaymentSettingsPage() {
  const router = useRouter()
  const { isSuperAdmin, isLoading: isAuthLoading } = useAuth()
  const { lang } = useLang()
  const {
    bankDetails,
    isLoading: isSettingsLoading,
    saveBankDetails,
  } = usePaymentSettings()

  const [formData, setFormData] = useState<PaymentBankDetails>(bankDetails)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthLoading) return
    if (!isSuperAdmin) {
      router.push("/dashboard")
    }
  }, [isAuthLoading, isSuperAdmin, router])

  useEffect(() => {
    setFormData(bankDetails)
  }, [bankDetails])

  if (isAuthLoading || isSettingsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">
          {lang === "ar" ? "جاري التحميل..." : "Loading..."}
        </p>
      </div>
    )
  }

  if (!isSuperAdmin) {
    return null
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setSaved(false)
    setError(null)
    try {
      await saveBankDetails(formData)
      setSaved(true)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : lang === "ar"
            ? "فشل حفظ الإعدادات."
            : "Failed to save settings."
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-primary">
            {lang === "ar" ? "إعدادات الدفع" : "Payment Settings"}
          </h1>
          <p className="text-muted-foreground">
            {lang === "ar"
              ? "بيانات التحويل البنكي المعروضة للمستخدمين عند الدفع"
              : "Bank transfer details shown to users when paying for a case"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Landmark className="h-5 w-5" />
              {lang === "ar" ? "بيانات التحويل البنكي" : "Bank Transfer Details"}
            </CardTitle>
            <CardDescription>
              {lang === "ar"
                ? "ستظهر هذه البيانات للمستخدمين في صفحة الدفع."
                : "These details will be shown to users on the payment page."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}
            {saved && (
              <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
                {lang === "ar"
                  ? "تم حفظ الإعدادات بنجاح."
                  : "Settings saved successfully."}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="currency">
                {lang === "ar" ? "العملة" : "Currency"}
              </Label>
              <Input
                id="currency"
                value={formData.currency}
                onChange={(e) =>
                  setFormData({ ...formData, currency: e.target.value })
                }
                placeholder="SAR"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bank_name">
                {lang === "ar" ? "اسم البنك" : "Bank Name"}
              </Label>
              <Input
                id="bank_name"
                value={formData.bank_name}
                onChange={(e) =>
                  setFormData({ ...formData, bank_name: e.target.value })
                }
                placeholder={
                  lang === "ar"
                    ? "مثال: البنك الأهلي السعودي"
                    : "e.g. National Commercial Bank"
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="beneficiary">
                {lang === "ar" ? "اسم المستفيد" : "Beneficiary Name"}
              </Label>
              <Input
                id="beneficiary"
                value={formData.beneficiary}
                onChange={(e) =>
                  setFormData({ ...formData, beneficiary: e.target.value })
                }
                placeholder={
                  lang === "ar"
                    ? "اسم صاحب الحساب"
                    : "Account holder name"
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="account_number">
                {lang === "ar" ? "رقم الحساب" : "Account Number"}
              </Label>
              <Input
                id="account_number"
                value={formData.account_number}
                onChange={(e) =>
                  setFormData({ ...formData, account_number: e.target.value })
                }
                placeholder={
                  lang === "ar" ? "أدخل رقم الحساب" : "Enter account number"
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="iban">IBAN</Label>
              <Input
                id="iban"
                dir="ltr"
                value={formData.iban}
                onChange={(e) =>
                  setFormData({ ...formData, iban: e.target.value })
                }
                placeholder="SA0000000000000000000000"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="me-1 h-4 w-4 animate-spin" />
                ) : null}
                {isSaving
                  ? lang === "ar"
                    ? "جارٍ الحفظ..."
                    : "Saving..."
                  : lang === "ar"
                    ? "حفظ"
                    : "Save"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
