import { cookies } from "next/headers"

import { PageNotFound } from "@/components/PageNotFound"
import type { Lang } from "@/types/form"

export default async function NotFoundPage() {
  const cookieStore = await cookies()
  const lang = (cookieStore.get("lang")?.value as Lang) || "en"

  return <PageNotFound lang={lang} />
}
