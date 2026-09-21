import Link from "next/link"
import { cookies } from "next/headers"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ParentRegistrationForm } from "@/components/register/ParentRegistrationForm"
import { t } from "@/lib/i18n"
import type { Lang } from "@/types/form"

export default async function ParentRegisterPage() {
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
          {t({ en: "Register as Parent", ar: "التسجيل كولي أمر" }, lang)}
        </h1>
      </div>

      <ParentRegistrationForm />
    </div>
  )
}