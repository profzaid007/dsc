"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useLang } from "@/lib/lang-context"

interface AttachmentRequestViewPageProps {
  params: Promise<{ id: string }>
}

export default function AttachmentRequestViewPage({
  params,
}: AttachmentRequestViewPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { lang } = useLang()

  useEffect(() => {
    // Redirect to assignment detail page
    // Since attachment_request is case-specific, there's no tool template
    // The ID is the assignment ID in case_tools
    router.push(`/dashboard/admin/assignments/${id}`)
  }, [id, router])

  return (
    <div className="flex items-center justify-center py-12">
      <p className="text-muted-foreground">
        {lang === "ar" ? "جارٍ إعادة التوجيه..." : "Redirecting..."}
      </p>
    </div>
  )
}
