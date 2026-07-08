export type ProfileStatus = "created"
export type ProfileProgramStatus = "enrolled" | "attended" | "absent"

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
  created: string
  updated: string
}
