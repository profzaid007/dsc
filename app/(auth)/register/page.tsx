import Link from "next/link"
import { cookies } from "next/headers"
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
import type { Lang } from "@/types/form"

export default async function RegisterPage() {
  const cookieStore = await cookies()
  const lang = (cookieStore.get("lang")?.value as Lang) || "en"

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button asChild variant="outline">
          <Link href="/login">
            {t(
              {
                en: "Already have an account? Login",
                ar: "لديك حساب؟ تسجيل الدخول",
              },
              lang
            )}
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">
            {t({ en: "Register", ar: "التسجيل" }, lang)}
          </CardTitle>
          <CardDescription>
            {t(
              {
                en: "Select your account type to get started",
                ar: "اختر نوع حسابك للبدء",
              },
              lang
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