export type MetricKey = "users" | "experts" | "cases" | "training" | "lectures" | "assignments"
export type DashboardCount = number | null
export type DashboardBucket = { key: string; count: DashboardCount }
export type DashboardSnapshot = {
  counts: Partial<Record<MetricKey, DashboardCount>>
  trend: { month: string; users?: DashboardCount; cases?: DashboardCount }[]
  caseStatus: DashboardBucket[]
  userRoles: DashboardBucket[]
  events: { key: "training" | "lectures"; total: DashboardCount; published: DashboardCount; completed: DashboardCount }[]
  attention: { key: "expert_approvals" | "payment_reviews" | "pending_assignments"; count: DashboardCount; href: string }[]
  errors: string[]
  fetchedAt: string
}

export interface DashboardClient {
  collection(name: string): {
    getList(page: number, perPage: number, options: {
      fields: string
      filter?: string
      skipTotal: boolean
      requestKey: null
      signal?: AbortSignal
    }): Promise<{ totalItems: number }>
  }
}

export const dashboardSources: Record<MetricKey, string> = {
  users: "users", experts: "expert_profiles", cases: "cases",
  training: "programs", lectures: "public_lectures", assignments: "case_tools",
}

/** UTC month boundaries keep the chart buckets and PocketBase timestamps consistent. */
export function dashboardMonths(now: Date, months: 6 | 12) {
  return Array.from({ length: months }, (_, i) => {
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - months + 1 + i, 1))
    const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1))
    const timestamp = (date: Date) => date.toISOString().replace("T", " ")
    return {
      month: start.toISOString().slice(0, 7),
      filter: `created >= "${timestamp(start)}" && created < "${timestamp(end)}"`,
    }
  })
}

/**
 * Uses exact count queries instead of downloading user or case records.
 * An absent metric means no permission; null means a failed request, never zero.
 */
export async function loadAdminDashboard(
  client: DashboardClient,
  can: (permission: string) => boolean,
  months: 6 | 12 = 6,
  now = new Date(),
  signal?: AbortSignal,
): Promise<DashboardSnapshot> {
  const queries: { id: string; collection: string; filter?: string }[] = []
  const values = new Map<string, DashboardCount>()
  const errors: string[] = []
  function count(id: string, collection: string, filter?: string) {
    queries.push({ id, collection, filter })
  }
  const permitted = (Object.keys(dashboardSources) as MetricKey[]).filter(key => can(`${key}.read`))
  for (const key of permitted) count(`total.${key}`, dashboardSources[key])
  const monthBuckets = dashboardMonths(now, months)
  for (const key of ["users", "cases"] as const) {
    if (can(`${key}.read`))
      for (const bucket of monthBuckets) count(`${key}.${bucket.month}`, dashboardSources[key], bucket.filter)
  }
  const caseKeys = ["pending", "awaiting_payment", "under_review", "active"]
  if (can("cases.read"))
    for (const key of caseKeys) count(`case.${key}`, "cases", `status = "${key}"`)
  const userKeys = ["expert", "parent", "individual", "organization", "care_foundation", "staff"]
  if (can("users.read"))
    for (const key of userKeys) count(`role.${key}`, "users", key === "staff" ? '(role = "admin" || role = "super_admin")' : `role = "${key}"`)
  for (const key of ["training", "lectures"] as const) {
    if (can(`${key}.read`))
      for (const status of ["published", "completed"])
        count(`${key}.${status}`, dashboardSources[key], `status = "${status}"`)
  }
  if (can("experts.read") && can("users.read")) count("attention.expert_approvals", "users", 'role = "expert" && is_active = false')
  if (can("assignments.read")) count("attention.pending_assignments", "case_tools", 'status = "pending"')

  // Bound simultaneous requests on larger 12-month views.
  let cursor = 0
  async function worker() {
    while (cursor < queries.length) {
      if (signal?.aborted) return
      const query = queries[cursor++]
      try {
        const result = await client.collection(query.collection).getList(1, 1, {
          fields: "id", filter: query.filter, skipTotal: false, requestKey: null, signal,
        })
        if (!Number.isSafeInteger(result.totalItems) || result.totalItems < 0) throw new Error("Invalid count response")
        values.set(query.id, result.totalItems)
      } catch {
        if (signal?.aborted) return
        values.set(query.id, null)
        errors.push(query.id)
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(4, queries.length) }, worker))
  if (signal?.aborted) throw new DOMException("Dashboard request cancelled", "AbortError")

  const value = (id: string): DashboardCount => values.get(id) ?? null
  const remainder = (total: DashboardCount, buckets: DashboardBucket[]) => {
    if (total === null || buckets.some(bucket => bucket.count === null)) return null
    return Math.max(0, total - buckets.reduce((sum, bucket) => sum + (bucket.count ?? 0), 0))
  }
  const counts: DashboardSnapshot["counts"] = {}
  for (const key of permitted) counts[key] = value(`total.${key}`)
  const caseStatus = can("cases.read") ? caseKeys.map(key => ({ key, count: value(`case.${key}`) })) : []
  if (caseStatus.length) caseStatus.push({ key: "other", count: remainder(counts.cases ?? null, caseStatus) })
  const userRoles = can("users.read") ? userKeys.map(key => ({ key, count: value(`role.${key}`) })) : []
  if (userRoles.length) userRoles.push({ key: "other", count: remainder(counts.users ?? null, userRoles) })
  const events: DashboardSnapshot["events"] = []
  for (const key of ["training", "lectures"] as const)
    if (can(`${key}.read`)) events.push({ key, total: counts[key] ?? null, published: value(`${key}.published`), completed: value(`${key}.completed`) })
  const attention: DashboardSnapshot["attention"] = []
  if (can("experts.read") && can("users.read")) attention.push({ key: "expert_approvals", count: value("attention.expert_approvals"), href: "/dashboard/admin/expert-approval" })
  if (can("cases.read") && can("payments.read")) attention.push({ key: "payment_reviews", count: value("case.under_review"), href: "/dashboard/admin/payments" })
  if (can("assignments.read")) attention.push({ key: "pending_assignments", count: value("attention.pending_assignments"), href: "/dashboard/admin/assignments" })
  return {
    counts,
    trend: monthBuckets.map(bucket => ({
      month: bucket.month,
      ...(can("users.read") ? { users: value(`users.${bucket.month}`) } : {}),
      ...(can("cases.read") ? { cases: value(`cases.${bucket.month}`) } : {}),
    })),
    caseStatus, userRoles, events, attention, errors,
    fetchedAt: new Date().toISOString(),
  }
}
