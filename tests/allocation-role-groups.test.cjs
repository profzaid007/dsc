const { test } = require("node:test")
const assert = require("node:assert/strict")
const fs = require("node:fs")
const ts = require("typescript")
const exportsState = {}
new Function("exports", "require", ts.transpileModule(
  fs.readFileSync("lib/allocation-role-groups.ts", "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } }
).outputText)(exportsState, () => JSON.parse(fs.readFileSync("lib/allocation-role-catalog.json", "utf8")))
const { normalizeAllocationRole, allocationRowsForSave } = exportsState
const role = (name, extra = {}) => ({ id: "existing-role", role_name_en: name, role_name_ar: "", tool_types: ["survey"], ...extra })

test("legacy seed roles remain selectable with their original IDs and permissions", () => {
  for (const [name, group] of [["Physician", "medical"], ["Social Specialist", "mental-health"], ["Teacher", "education"], ["Trainer", "education"]]) {
    const result = normalizeAllocationRole(role(name))
    assert.equal(result.role_group, group)
    assert.equal(result.id, "existing-role")
    assert.deepEqual(result.tool_types, ["survey"])
  }
})
test("catalog and custom roles without group metadata do not disappear", () => {
  assert.equal(normalizeAllocationRole(role("Speech-Language Pathologist")).role_group, "special-needs")
  assert.equal(normalizeAllocationRole(role("New custom role")).role_group, "other")
  const configured = role("Custom", { role_group: "leadership", is_retired: true })
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
