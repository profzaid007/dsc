"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface ReportViewPageProps {
  params: Promise<{ id: string }>
}

export default function ReportViewPage({ params }: ReportViewPageProps) {
  const { id } = use(params)
  const router = useRouter()

  useEffect(() => {
    // Redirect to report edit page (new page with edit param)
    router.push(`/dashboard/admin/tools/report/new?edit=${id}`)
  }, [id, router])

  return (
    <div className="flex items-center justify-center py-12">
      <p className="text-muted-foreground">Redirecting...</p>
    </div>
  )
}
