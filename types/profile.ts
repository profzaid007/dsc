export type ProfileStatus =
  | "created"
  | "assessment_started"
  | "assessment_completed"
  | "active"
  | "archived"

export interface Profile {
  id: string
  userId: string
  childName: string
  age: number
  gender: string
  grade: string
  parentName: string
  phone: string
  email: string
  mainConcern: string[]
  notes: string
  status: ProfileStatus
  createdAt: string
  updatedAt: string
}
