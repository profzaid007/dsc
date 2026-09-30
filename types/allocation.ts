export interface CaseExpert {
  id: string
  case_id: string
  expert_id: string
  /** Matches `role_name_en` of a roles_management record */
  role: string
  created: string
  updated: string
  expand?: {
    expert_id?: import("./user").User
  }
}
