export type UserType = "parent" | "individual" | "organization" | "expert"
export type UserRole =
  | "user"
  | "super_admin"
  | "admin"
  | "individual"
  | "parent"
  | "organization"
  | "expert"

export interface User {
  id: string
  email: string
  name: string
  avatar: string
  role: UserRole
  is_active: boolean
  contact_number: string
  organization_name?: string
  user_type?: string // relation to lookups collection
  message?: string
  attachments?: string[]
  created: string
  updated: string
}

export interface AuthState {
  token: string
  user: User
}
