import { test } from "node:test"
import assert from "node:assert/strict"
import { dashboardMonths, loadAdminDashboard, type DashboardClient } from "../lib/admin-dashboard"

const now = new Date("2026-10-15T10:00:00Z")
type Call = { collection: string; filter?: string }
function mockClient(resolve: (call: Call) => number | Promise<number>) {
  const calls: Call[] = []
  let active = 0
  let maximum = 0
  const client: DashboardClient = {
    collection(collection) {
      return {
        async getList(page, perPage, options) {
          assert.equal(page, 1)
          assert.equal(perPage, 1)
          assert.equal(options.fields, "id")
          assert.equal(options.skipTotal, false)
          assert.equal(options.requestKey, null)
          const call = { collection, filter: options.filter }
          calls.push(call)
          maximum = Math.max(maximum, ++active)
          try { return { totalItems: await resolve(call) } }
          finally { active-- }
        },
      }
    },
  }
  return { client, calls, maximum: () => maximum }
}

test("dashboard performs no protected requests without metric permissions", async () => {
  const mock = mockClient(() => { throw new Error("Unexpected request") })
  const result = await loadAdminDashboard(mock.client, () => false, 6, now)
  assert.equal(mock.calls.length, 0)
  assert.deepEqual(result.counts, {})
  assert.deepEqual(result.events, [])
  assert.deepEqual(result.attention, [])
})

test("case-only access queries exact totals and payment lifecycle without loading personal data", async () => {
  const mock = mockClient(({ filter }) => {
    if (!filter) return 13
    const statuses: Record<string, number> = { pending: 1, awaiting_payment: 2, under_review: 3, active: 4 }
    const status = filter.match(/^status = "([^"]+)"$/)?.[1]
    return status ? statuses[status] : 2
  })
  const result = await loadAdminDashboard(mock.client, p => p === "cases.read", 6, now)
  assert.deepEqual(result.counts, { cases: 13 })
  assert.ok(mock.calls.every(call => call.collection === "cases"))
  assert.deepEqual(result.caseStatus.map(bucket => bucket.count), [1, 2, 3, 4, 3])
  assert.equal(result.trend.length, 6)
  assert.ok(result.trend.every(bucket => bucket.cases === 2 && !("users" in bucket)))
  assert.deepEqual(result.attention, []) // No link to payment administration without payments.read.
})

test("failed counts remain unavailable instead of becoming zero, including derived buckets", async () => {
  const mock = mockClient(({ filter }) => {
    if (filter === 'status = "under_review"') throw new Error("Connection failed")
    return filter ? 0 : 5
  })
  const result = await loadAdminDashboard(mock.client, p => ["cases.read", "payments.read"].includes(p), 6, now)
  assert.equal(result.caseStatus.find(bucket => bucket.key === "pending")?.count, 0)
  assert.equal(result.caseStatus.find(bucket => bucket.key === "under_review")?.count, null)
  assert.equal(result.caseStatus.find(bucket => bucket.key === "other")?.count, null)
  assert.deepEqual(result.errors, ["case.under_review"])
  assert.equal(result.attention[0].count, null)
})

test("event and approval metrics respect independent grants", async () => {
  const mock = mockClient(() => 2)
  const result = await loadAdminDashboard(mock.client, p => ["training.read", "experts.read"].includes(p), 6, now)
  assert.deepEqual(result.counts, { experts: 2, training: 2 })
  assert.ok(mock.calls.every(call => ["expert_profiles", "programs"].includes(call.collection)))
  assert.equal(result.events.length, 1)
  assert.equal(result.events[0].key, "training")
  assert.deepEqual(result.attention, [])
})

test("monthly windows cover year changes in UTC with exclusive end boundaries", () => {
  const buckets = dashboardMonths(new Date("2026-01-31T23:59:59Z"), 6)
  assert.equal(buckets[0].month, "2025-08")
  assert.equal(buckets[5].month, "2026-01")
  assert.equal(buckets[5].filter, 'created >= "2026-01-01 00:00:00.000Z" && created < "2026-02-01 00:00:00.000Z"')
  assert.equal(dashboardMonths(now, 12).length, 12)
})

test("full access is bounded to four concurrent count requests", async () => {
  const mock = mockClient(async () => {
    await new Promise(resolve => setTimeout(resolve, 1))
    return 0
  })
  const result = await loadAdminDashboard(mock.client, () => true, 12, now)
  assert.ok(mock.maximum() <= 4)
  assert.equal(result.trend.length, 12)
  assert.equal(result.attention.length, 3)
  assert.equal(Object.keys(result.counts).length, 6)
  assert.equal(result.errors.length, 0)
})

test("cancellation stops stale dashboard results from being returned", async () => {
  const controller = new AbortController()
  controller.abort()
  const mock = mockClient(() => 1)
  await assert.rejects(loadAdminDashboard(mock.client, () => true, 6, now, controller.signal), { name: "AbortError" })
  assert.equal(mock.calls.length, 0)
})

test("malformed API totals do not become misleading statistics", async () => {
  const mock = mockClient(() => Number.NaN)
  const result = await loadAdminDashboard(mock.client, p => p === "experts.read", 6, now)
  assert.equal(result.counts.experts, null)
  assert.deepEqual(result.errors, ["total.experts"])
})
