export const EXPERT_ROLES = [
  "Primary Expert",
  "Secondary Expert",
  "Reviewer",
  "Observer",
] as const

export type ExpertRole = (typeof EXPERT_ROLES)[number]

export interface CaseExpert {
  id: string
  case: string
  expert: string
  role: ExpertRole
  created: string
  updated: string
  expand?: {
    expert?: import("./user").User
  }
}
