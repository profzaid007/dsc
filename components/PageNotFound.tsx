import Link from "next/link"

import { t } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import type { BilingualString, Lang } from "@/types/form"

interface PageNotFoundProps {
  lang: Lang
  backHref?: string
  backLabel?: BilingualString
}

export function PageNotFound({
  lang,
  backHref = "/",
  backLabel = { en: "Home", ar: "الرئيسية" },
}: PageNotFoundProps) {
  return (
    <div className="mx-auto my-auto flex max-w-4xl flex-col items-center px-6 py-16 text-center">
      <p className="text-7xl font-bold tracking-tight text-muted-foreground/30">
        404
      </p>
      <h1 className="mt-4 text-2xl font-bold sm:text-3xl">
        {t(
          {
            en: "Page not found",
            ar: "الصفحة غير موجودة",
          },
          lang
        )}
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        {t(
          {
            en: "This page has not been found.",
            ar: "لم يتم العثور على هذه الصفحة.",
          },
          lang
        )}
      </p>
      <Button asChild className="mt-8" size="lg">
        <Link href={backHref}>{t(backLabel, lang)}</Link>
      </Button>
    </div>
  )
}
