"use client"

import { use, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useLang } from "@/lib/lang-context"

interface EditPageProps {
  params: Promise<{ id: string }>
}

export default function EditPlanPage({ params }: EditPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { lang } = useLang()

  useEffect(() => {
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
