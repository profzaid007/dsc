export type ProfileStatus = "created"

export interface Profile {
  id: string
  user: string
  name: string
  date_of_birth: string
  gender: "male" | "female"
  grade: string
  main_concerns: string[]
  notes: string
  created: string
  updated: string
}
