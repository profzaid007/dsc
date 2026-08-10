export type ProfileStatus = "created"
export type ProfileProgramStatus = "enrolled" | "attended" | "absent"
export type CasePaymentStatus =
  | "pending"
  | "awaiting_payment"
  | "under_review"
  | "active"

export interface UserDetails {
  name: string
  email: string
  contact?: string
}

export interface Profile {
  id: string
  user: string
  name: string
  date_of_birth?: string
  gender?: "male" | "female"
  grade?: string
  notes?: string
  category?: string
  sub_category?: string
  case_details?: Record<string, unknown>
  service_type?: string
  portal_type?: string
  training_link?: string
  program_id?: string
  program_status?: ProfileProgramStatus
  user_details?: UserDetails
  status?: CasePaymentStatus
  is_paid?: boolean
  payment_amount?: number
  payment_slip?: string
  payment_reject_reason?: string
  created: string
  updated: string
  expand?: {
    user?: import("./user").User
  }
}
