export type UserType = "individual" | "institution"
export type UserRole = "user" | "super_admin" | "admin"

export interface User {
  id: string
  email: string
  name: string
  avatar: string
  role: UserRole
  is_active: boolean
  contact_number: string
  created: string
  updated: string
}

export interface AuthState {
  token: string
  user: User
}
