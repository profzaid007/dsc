"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useLang } from "@/lib/lang-context"

interface MeetingViewPageProps {
  params: Promise<{ id: string }>
}

export default function MeetingViewPage({ params }: MeetingViewPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { lang } = useLang()

  useEffect(() => {
    router.push(`/dashboard/admin/tools/one-to-one-meeting/new?edit=${id}`)
  }, [id, router])

  return (
    <div className="flex items-center justify-center py-12">
      <p className="text-muted-foreground">
        {lang === "ar" ? "جارٍ إعادة التوجيه..." : "Redirecting..."}
      </p>
    </div>
  )
}
