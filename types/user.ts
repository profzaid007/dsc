export type UserType = "individual" | "institute"
export type UserRole = "user" | "admin"

export interface User {
  id: string
  name: string
  email: string
  type: UserType
  role: UserRole
  createdAt: string
  updatedAt: string
}
