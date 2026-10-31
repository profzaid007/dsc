export interface CaseExpert {
  id: string
  case_id: string
  expert_id: string
  /** Relation to the `roles_management` record assigned to the expert on this case */
  role_id: string
  created: string
  updated: string
  expand?: {
    expert_id?: import("./user").User
    role_id?: import("./expert-role").RolesManagement
  }
}
