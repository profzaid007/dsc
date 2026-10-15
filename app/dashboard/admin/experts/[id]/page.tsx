"use client"
import { usePermissions } from "@/hooks/usePermissions"
import { use } from "react"
import AdminUserDetailPage from "@/app/dashboard/admin/users/[id]/page"
import { ExpertBankDetails } from "@/components/dashboard/ExpertBankDetails"
export default function ExpertDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const access = usePermissions()
  return (
    <div className="space-y-6">
      <AdminUserDetailPage params={params} />
      {access.can("payments.read") && (
        <ExpertBankDetails key={id} userId={id} />
      )}
    </div>
  )
}
