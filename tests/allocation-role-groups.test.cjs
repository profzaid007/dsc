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
