export type ProfileStatus = "created"

export interface Profile {
  id: string
  user: string
  name: string
  date_of_birth: string
  gender: "male" | "female"
  grade: string
  notes: string
  category: string
  sub_category: string
  case_details: Record<string, unknown>
  created: string
  updated: string
}
