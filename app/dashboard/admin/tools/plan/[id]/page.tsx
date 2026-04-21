"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface PlanViewPageProps {
  params: Promise<{ id: string }>
}

export default function PlanViewPage({ params }: PlanViewPageProps) {
  const { id } = use(params)
  const router = useRouter()

  useEffect(() => {
    // Redirect to plan edit page (new page with edit param)
    router.push(`/dashboard/admin/tools/plan/new?edit=${id}`)
  }, [id, router])

  return (
    <div className="flex items-center justify-center py-12">
      <p className="text-muted-foreground">Redirecting...</p>
    </div>
  )
}
