export type AssignmentStatus =
  | "assigned"
  | "in_progress"
  | "completed"
  | "cancelled"

export interface ProfileTool {
  id: string
  profileId: string
  toolId: string
  assignedBy: string
  status: AssignmentStatus
  isVisibleToUser: boolean
  responseData: Record<string, unknown>
  dueDate?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}

export interface ToolResponse {
  id: string
  profileToolId: string
  data: Record<string, unknown>
  attachments?: string[]
  submittedAt: string
  isInternal: boolean
}
