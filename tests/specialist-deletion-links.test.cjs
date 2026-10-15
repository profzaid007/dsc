const { test } = require("node:test")
const assert = require("node:assert/strict")
const fs = require("node:fs")
const ts = require("typescript")
function load(results) {
  let deletes = 0
  const exports = {}
  const pb = {
    filter: (template, values) => { assert.ok(values.id); return template },
    collection: name => ({
      getList: async (page, limit, options) => { assert.equal(limit, 50); assert.ok(options.fields.includes("id")); return results[name] },
      delete: async () => { deletes++ },
    }),
  }
  new Function("exports", "require", ts.transpileModule(fs.readFileSync("lib/specialist-deletion.ts", "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText)(exports, () => ({ __esModule: true, default: pb }))
  return { ...exports, deletes: () => deletes }
}
test("role blocker includes the actual case and assigned expert rather than a generic error", async () => {
  const api = load({
    expert_profiles: { items: [], totalItems: 0 },
    case_experts: { items: [{ id: "assignment", case_id: "case", expand: { case_id: { name: "Autism & ADHD" }, expert_id: { name: "Hala aref" } } }], totalItems: 1 },
  })
  await assert.rejects(api.deleteSpecialistItem("role", "physician"), error => {
    assert.ok(error instanceof api.SpecialistDeletionBlockedError)
    assert.equal(error.links[0].label, "Case: Autism & ADHD")
    assert.equal(error.links[0].detail, "Assigned expert: Hala aref")
    assert.equal(error.links[0].href, "/dashboard/admin/cases/case")
    assert.equal(error.total, 1)
    return true
  })
  assert.equal(api.deletes(), 0)
})
test("profile blocker uses user IDs for expert links and retains total counts", async () => {
  const api = load({
    expert_profiles: { items: [{ id: "profile", user: "user", public_name_ar: "خبير", expand: { user: { name: "Expert" } } }], totalItems: 60 },
    case_experts: { items: [], totalItems: 0 },
  })
  await assert.rejects(api.deleteSpecialistItem("role", "role", true), error => {
    assert.equal(error.links[0].label, "ملف الخبير: خبير")
    assert.equal(error.links[0].href, "/dashboard/admin/experts/user")
    assert.equal(error.total, 60)
    return true
  })
})
