import { test } from "node:test"
import assert from "node:assert/strict"
import { registerHooks } from "node:module"
import { renderToStaticMarkup } from "react-dom/server"
import type { DashboardSnapshot } from "../lib/admin-dashboard"

// CSS layout is compiled by Next; these server-render tests inspect content and states.
registerHooks({
  load(url, context, nextLoad) {
    if (url.endsWith(".module.css")) return {
      format: "module", shortCircuit: true,
      source: "export default new Proxy({}, { get: (_, key) => String(key) })",
    }
    return nextLoad(url, context)
  },
})
const { DashboardView } = await import("../components/admin/AdminStatisticsDashboard")

const data: DashboardSnapshot = {
  counts: { users: 5, cases: 3 },
  trend: [{ month: "2026-09", users: 2, cases: 1 }, { month: "2026-10", users: 1, cases: 2 }],
  caseStatus: [{ key: "pending", count: 1 }, { key: "active", count: 2 }],
  userRoles: [{ key: "parent", count: 4 }, { key: "staff", count: 1 }],
  events: [], attention: [], errors: [], fetchedAt: "2026-10-15T10:00:00Z",
}
function render(overrides: Partial<React.ComponentProps<typeof DashboardView>> = {}) {
  return renderToStaticMarkup(<DashboardView
    lang="en" name="Reviewer"
    access={{ isLoading: false, error: false, isSuperAdmin: false, can: p => ["users.read", "cases.read"].includes(p), refresh() {} }}
    data={data} isLoading={false} isRefreshing={false} refresh={() => {}} months={6} setMonths={() => {}}
    {...overrides}
  />)
}

test("overview renders live-data chart sections, accessible monthly table and only available cards", () => {
  const html = render()
  for (const text of ["Admin overview", "Monthly activity", "Case status", "Account mix", "View monthly figures", "current month to date (UTC)"]) assert.ok(html.includes(text), text)
  assert.ok(html.includes('href="/dashboard/admin/cases"'))
  assert.ok(!html.includes('href="/dashboard/admin/experts"'))
  assert.ok(!html.includes("Manage roles &amp; permissions"))
  assert.equal((html.match(/role="img"/g) ?? []).length, 2)
  assert.ok(html.includes("<table>"))
})

test("Arabic overview uses RTL and translated chart/action labels", () => {
  const html = render({ lang: "ar" })
  for (const text of ["نظرة عامة", "النشاط الشهري", "توزيع الحالات", "توزيع الحسابات", "عرض الأرقام الشهرية", "تحديث"]) assert.ok(html.includes(text), text)
  assert.ok(html.includes('dir="rtl"'))
  assert.ok(!html.includes("Admin overview"))
  assert.ok(!html.includes("Monthly activity"))
})

test("loading and fatal failures never display stale counts as successful results", () => {
  const loading = render({ isLoading: true })
  assert.ok(loading.includes("Loading statistics"))
  assert.ok(!loading.includes("Account mix"))
  const failed = render({ data: null })
  assert.ok(failed.includes("Statistics could not be loaded."))
  assert.ok(failed.includes("Retry"))
  assert.ok(!failed.includes("Loading statistics"))
})

test("zero and unavailable case charts do not draw a false full data ring", () => {
  const empty = render({ data: { ...data, counts: { cases: 0 }, trend: [{ month: "2026-10", cases: 0 }], caseStatus: [{ key: "pending", count: 0 }], userRoles: [] } })
  assert.ok(empty.includes("No new activity in this period."))
  assert.ok(!empty.includes('pathLength="100"'))
  assert.ok(!empty.includes("NaN"))
  const partial = render({ data: { ...data, counts: { cases: null }, caseStatus: [{ key: "pending", count: null }], errors: ["total.cases"] } })
  assert.ok(partial.includes("Unavailable"))
  assert.ok(partial.includes("Some case counts are unavailable."))
  assert.ok(!partial.includes('pathLength="100"'))
})

test("non-statistical permissions produce a compact authorized workspace", () => {
  const html = render({
    data: { ...data, counts: {}, trend: [], caseStatus: [], userRoles: [] },
    access: { isLoading: false, error: false, isSuperAdmin: false, can: p => p === "messages.read", refresh() {} },
  })
  assert.ok(html.includes("Your workspace"))
  assert.ok(html.includes('href="/dashboard/messages"'))
  assert.ok(!html.includes('href="/dashboard/admin/users"'))
  assert.ok(!html.includes('role="img"'))
})
