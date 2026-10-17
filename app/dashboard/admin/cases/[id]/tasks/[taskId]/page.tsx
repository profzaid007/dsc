"use client"
import { use, useMemo } from "react"
import AssignmentDetails from "@/app/dashboard/admin/assignments/[id]/page"
export default function CaseTaskPage({ params }: { params: Promise<{ id: string; taskId: string }> }) {
  const { taskId } = use(params)
  const taskParams = useMemo(() => Promise.resolve({ id: taskId }), [taskId])
  return <AssignmentDetails params={taskParams} />
}
