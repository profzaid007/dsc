import { redirect } from "next/navigation"
export default async function AllocationsPage({ searchParams }: { searchParams: Promise<{ case?: string }> }) {
  const { case: caseId } = await searchParams
  redirect(caseId ? `/dashboard/admin/cases/${encodeURIComponent(caseId)}#case-allocations` : "/dashboard/admin/cases")
}
