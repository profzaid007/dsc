import pb from "@/lib/pb"

export const securityModules = [
  ["users", "Users", "المستخدمون"],
  ["experts", "Experts", "الخبراء"],
  ["cases", "Cases", "الحالات"],
  ["tools", "Tools", "الأدوات"],
  ["assignments", "Assignments", "التكليفات"],
  ["allocations", "Allocations", "التخصيصات"],
  ["training", "Training", "التدريب"],
  ["lectures", "Public lectures", "المحاضرات العامة"],
  ["payments", "Payments", "المدفوعات"],
  ["cms", "Content", "المحتوى"],
  ["settings", "Settings", "الإعدادات"],
  ["messages", "Messages", "الرسائل"],
] as const
export function routePermission(path: string): string | null {
  if (
    (/^\/cms\/(home-pages|blog)\/[^/]+$/.test(path) &&
      path !== "/cms/blog/categories") ||
    /^\/cms\/info\/[^/]+\/[^/]+$/.test(path)
  )
    return "cms.update"
  if (path.startsWith("/cms"))
    return (
      "cms." +
      (/\/new(?:\/|$)/.test(path)
        ? "create"
        : /\/edit(?:\/|$)/.test(path)
          ? "update"
          : "read")
    )
  if (path === "/dashboard/admin/settings") return null
  if (path === "/dashboard/messages") return "messages.read"
  const section = path.split("/")[3]
  const moduleName =
    section === "public-lectures"
      ? "lectures"
      : section === "expert-approval"
        ? "experts"
        : section
  if (!securityModules.some(([key]) => key === moduleName)) return null
  return (
    moduleName +
    "." +
    (/\/new(?:\/|$)/.test(path)
      ? "create"
      : /\/edit(?:\/|$)/.test(path)
        ? "update"
        : "read")
  )
}
export const refreshPermissions = () =>
  window.dispatchEvent(new Event("dsc:permissions-changed"))
export type SecurityRole = {
  id: string
  key: string
  name_en: string
  name_ar: string
  description: string
  is_active: boolean
  is_system: boolean
  permissions: string[]
  user_count: number
}
export type SecurityPermission = {
  id: string
  key: string
  module: string
  action: string
  name_en: string
  name_ar: string
}
export type SecurityUser = {
  id: string
  name: string
  email: string
  role: string
  is_active: boolean
  roles: string[]
  permissions: string[]
}
export type SecurityAudit = {
  id: string
  actor: string
  action: string
  target_type: string
  target_id: string
  before: unknown
  after: unknown
  created: string
}
export type SecurityState = {
  roles: SecurityRole[]
  permissions: SecurityPermission[]
  users: SecurityUser[]
  audit: SecurityAudit[]
}
export const securityApi = <T>(path: string, method = "GET", body?: unknown) =>
  pb.send<T>("/api/dsc/security" + path, { method, body })
