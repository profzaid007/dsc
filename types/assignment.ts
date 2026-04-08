export type AssignmentStatus =
  | "pending"
  | "assigned"
  | "in_progress"
  | "completed"

export interface CaseTool {
  id: string
  case: string
  tool: string
  responses: Record<string, unknown>
  status: AssignmentStatus
  is_visible_to_user: boolean
  assigned_at: string
  media: string[]
  created: string
  updated: string
}
