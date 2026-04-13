"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface AttachmentRequestViewPageProps {
  params: Promise<{ id: string }>
}

export default function AttachmentRequestViewPage({
  params,
}: AttachmentRequestViewPageProps) {
  const { id } = use(params)
  const router = useRouter()

  useEffect(() => {
    // Redirect to assignment detail page
    // Since attachment_request is case-specific, there's no tool template
    // The ID is the assignment ID in case_tools
    router.push(`/dashboard/admin/assignments/${id}`)
  }, [id, router])

  return (
    <div className="flex items-center justify-center py-12">
      <p className="text-muted-foreground">Redirecting...</p>
    </div>
  )
}
