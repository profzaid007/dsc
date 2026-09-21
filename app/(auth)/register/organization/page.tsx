import Link from "next/link"
import { cookies } from "next/headers"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OrganizationRegistrationForm } from "@/components/register/OrganizationRegistrationForm"
import { t } from "@/lib/i18n"
import type { Lang } from "@/types/form"

export default async function OrganizationRegisterPage() {
  const cookieStore = await cookies()
  const lang = (cookieStore.get("lang")?.value as Lang) || "en"
  const BackIcon = lang === "ar" ? ArrowRight : ArrowLeft

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/register">
            <BackIcon className="h-4 w-4 me-1" />
            {t({ en: "Back", ar: "رجوع" }, lang)}
          </Link>
        </Button>
        <h1 className="text-xl font-bold text-primary">
          {t({ en: "Register as Organization", ar: "التسجيل كمؤسسة" }, lang)}
        </h1>
      </div>

      <OrganizationRegistrationForm />
    </div>
  )
}