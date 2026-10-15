export type SecurityFailure =
  | "not_deployed"
  | "session_expired"
  | "account_denied"
  | "unreachable"
  | "service_error"

export function securityFailure(error: unknown): SecurityFailure {
  const status =
    error && typeof error === "object" && "status" in error
      ? Number(error.status)
      : undefined
  if (status === 404) return "not_deployed"
  if (status === 401) return "session_expired"
  if (status === 403) return "account_denied"
  if (status === 0) return "unreachable"
  return "service_error"
}

export function validSecurityAccess(
  data: unknown
): data is { permissions: string[]; is_super_admin: boolean } {
  if (!data || typeof data !== "object") return false
  return (
    "permissions" in data &&
    Array.isArray(data.permissions) &&
    data.permissions.every((value: unknown) => typeof value === "string") &&
    "is_super_admin" in data &&
    typeof data.is_super_admin === "boolean"
  )
}
