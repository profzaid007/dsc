import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserTypeSelector } from "@/components/register/UserTypeSelector"
import { t } from "@/lib/i18n"

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button asChild variant="outline">
          <Link href="/login">
            {t({ en: "Already have an account? Login", ar: "لديك حساب؟ تسجيل الدخول" }, "en")}
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">
            {t({ en: "Register", ar: "التسجيل" }, "en")}
          </CardTitle>
          <CardDescription>
            {t(
              {
                en: "Select your account type to get started",
                ar: "اختر نوع حسابك للبدء",
              },
              "en"
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserTypeSelector />
        </CardContent>
      </Card>
    </div>
  )
}
