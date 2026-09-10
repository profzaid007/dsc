import type { UserRole } from "@/types/user"

export function getDashboardPath(role?: UserRole | string | null): string {
  switch (role) {
    case "admin":
    case "super_admin":
      return "/dashboard/admin"
    case "expert":
      return "/dashboard/expert"
    case "organization":
      return "/dashboard/institution"
    case "individual":
      return "/dashboard/individual"
    case "parent":
      return "/dashboard/parent"
    default:
      return "/dashboard/cases"
  }
}
