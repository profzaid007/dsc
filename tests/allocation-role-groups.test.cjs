const { test } = require("node:test")
const assert = require("node:assert/strict")
const fs = require("node:fs")
const ts = require("typescript")
const exportsState = {}
new Function("exports", "require", ts.transpileModule(
  fs.readFileSync("lib/allocation-role-groups.ts", "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } }
).outputText
)(exportsState, name => {
  if (name === "./classification") {
    const classification = {}
    new Function("exports", "require", ts.transpileModule(fs.readFileSync("lib/classification.ts", "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText)(classification, () => JSON.parse(fs.readFileSync("lib/classification-catalog.json", "utf8")))
    return classification
  }
  return JSON.parse(fs.readFileSync("lib/allocation-role-catalog.json", "utf8"))
})
const { normalizeAllocationRole, allocationRowsForSave } = exportsState
const role = (name, extra = {}) => ({ id: "existing-role", role_name_en: name, role_name_ar: "", tool_types: ["survey"], ...extra })

test("missing or obsolete role groups require correction instead of inferred categories", () => {
 for (const name of ["Physician", "Teacher", "Custom"]) assert.throws(() => normalizeAllocationRole(role(name)), /needs a corrected/)
 assert.throws(() => normalizeAllocationRole(role("Teacher", {role_group:"psychology"})), /needs a corrected/)
 const configured = role("Teacher", {role_group:"education"})
 assert.equal(normalizeAllocationRole(configured), configured)
})

test("allocation save sends the backend role relation and rejects stale selections", () => {
  const row = { id: "allocation", expert_id: "expert", role: "Teacher" }
  const [payload] = allocationRowsForSave([row], [role("Teacher")])
  assert.equal(payload.role_id, "existing-role")
  assert.equal(payload.id, "allocation")
  assert.equal(payload.expert_id, "expert")
  assert.throws(() => allocationRowsForSave([row], []), /no longer available/)
})

test("administrator-created classification keys remain attached to their roles", () => {
  const custom = role("Custom specialist", { role_group: "custom-topic" })
  assert.equal(normalizeAllocationRole(custom), custom)
  assert.equal(normalizeAllocationRole(custom).role_group, "custom-topic")
})


test("current category relation supplies group, order and availability without legacy fields", () => {
  const current = role("Orthopedic Specialist", { category: "medical-id", order: 37, is_active: true, expand: { category: { id: "medical-id", key: "medical", is_active: true } } })
  const normalized = normalizeAllocationRole(current)
  assert.equal(normalized.role_group, "medical")
  assert.equal(normalized.role_order, 37)
  assert.equal(normalized.is_retired, false)
  assert.equal(current.role_group, undefined)
  assert.equal(normalizeAllocationRole({ ...current, role_group: "psychology" }).role_group, "medical")
  assert.equal(normalizeAllocationRole({ ...current, is_active: false }).is_retired, true)
  assert.equal(normalizeAllocationRole({ ...current, expand: { category: { id: "medical-id", key: "medical", is_active: false } } }).is_retired, true)
  assert.throws(() => normalizeAllocationRole({ ...current, expand: undefined, role_group: "medical" }), /corrected professional category/)
  assert.throws(() => normalizeAllocationRole({ ...current, expand: { category: { id: "other", key: "medical" } } }), /corrected professional category/)
  assert.throws(() => normalizeAllocationRole({ ...current, expand: { category: { id: "medical-id", key: "custom", media_only: true } } }), /corrected professional category/)
})
