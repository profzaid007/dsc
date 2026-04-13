"use client"

import { use, useEffect } from "react"
import { useRouter } from "next/navigation"

interface EditPageProps {
  params: Promise<{ id: string }>
}

export default function EditMultipleChoicePage({ params }: EditPageProps) {
  const { id } = use(params)
  const router = useRouter()

  useEffect(() => {
    // For now, redirect to view page
    // Full edit functionality can be added later by reusing the builder
    router.push(`/dashboard/admin/tools/multiple-choice/${id}`)
  }, [id, router])

  return (
    <div className="flex items-center justify-center py-12">
      <p className="text-muted-foreground">Redirecting...</p>
    </div>
  )
}
