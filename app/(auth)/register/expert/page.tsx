import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ExpertApplicationForm } from "@/components/register/ExpertApplicationForm"
import { t } from "@/lib/i18n"

export default function ExpertRegisterPage() {
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
          {t({ en: "Apply as Expert", ar: "التقديم كخبير" }, "en")}
        </h1>
      </div>

      <ExpertApplicationForm />
    </div>
  )
}
