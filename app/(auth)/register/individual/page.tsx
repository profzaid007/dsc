import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { IndividualRegistrationForm } from "@/components/register/IndividualRegistrationForm"
import { t } from "@/lib/i18n"

export default function IndividualRegisterPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/register">
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t({ en: "Back", ar: "رجوع" }, "en")}
          </Link>
        </Button>
        <h1 className="text-xl font-bold text-primary">
          {t({ en: "Register as Individual", ar: "التسجيل كفرد" }, "en")}
        </h1>
      </div>

      <IndividualRegistrationForm />
    </div>
  )
}
