export const EXPERT_ROLES = [
  "physician",
  "social",
  "teacher",
  "trainer",
] as const

export type ExpertRole = (typeof EXPERT_ROLES)[number]

export interface CaseExpert {
  id: string
  case_id: string
  expert_id: string
  role: ExpertRole
  created: string
  updated: string
  expand?: {
    expert_id?: import("./user").User
  }
}
