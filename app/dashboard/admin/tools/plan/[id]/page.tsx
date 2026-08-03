"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useLang } from "@/lib/lang-context"

interface PlanViewPageProps {
  params: Promise<{ id: string }>
}

export default function PlanViewPage({ params }: PlanViewPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { lang } = useLang()

  useEffect(() => {
    // Redirect to plan edit page (new page with edit param)
    router.push(`/dashboard/admin/tools/plan/new?edit=${id}`)
  }, [id, router])

  return (
    <div className="flex items-center justify-center py-12">
      <p className="text-muted-foreground">
        {lang === "ar" ? "جارٍ إعادة التوجيه..." : "Redirecting..."}
      </p>
    </div>
  )
}
