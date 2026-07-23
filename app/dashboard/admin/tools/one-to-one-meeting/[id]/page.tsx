"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface MeetingViewPageProps {
  params: Promise<{ id: string }>
}

export default function MeetingViewPage({ params }: MeetingViewPageProps) {
  const { id } = use(params)
  const router = useRouter()

  useEffect(() => {
    router.push(`/dashboard/admin/tools/one-to-one-meeting/new?edit=${id}`)
  }, [id, router])

  return (
    <div className="flex items-center justify-center py-12">
      <p className="text-muted-foreground">Redirecting...</p>
    </div>
  )
}
