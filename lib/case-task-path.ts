import { getCurrentUser } from "@/lib/pb"

export function caseTaskPath(caseId: string, taskId?: string) {
  const id = encodeURIComponent(caseId)
  if (getCurrentUser()?.role === "expert") return `/dashboard/expert/cases/${id}`
  return `/dashboard/admin/cases/${id}${taskId ? `/tasks/${encodeURIComponent(taskId)}` : "#case-assignments"}`
}
