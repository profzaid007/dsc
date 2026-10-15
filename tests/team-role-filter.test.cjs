const { test } = require("node:test")
const assert = require("node:assert/strict")
const fs = require("node:fs")
const ts = require("typescript")
const vm = require("node:vm")
function load(file, mocks) {
  const exports = {}
  new Function("exports", "require", ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText)(exports, name => {
    assert.ok(name in mocks, `Unexpected dependency: ${name}`)
    return mocks[name]
  })
  return exports
}
const groups = load("lib/allocation-role-groups.ts", {
  "./allocation-role-catalog.json": JSON.parse(fs.readFileSync("lib/allocation-role-catalog.json", "utf8")),
})

test("anonymous team filtering derives every category from saved profile role IDs", async () => {
  const records = [
    { id: "teacher", specialist_roles: ["teach", "doctor"] },
    { id: "therapist", specialist_roles: '["speech"]' },
    { id: "unassigned", specialist_roles: [] },
  ]
  const roles = [
    { id: "teach", role_name_en: "Teacher" },
    { id: "doctor", role_name_en: "Physician" },
    { id: "speech", role_name_en: "Speech-Language Pathologist" },
  ]
  const { getTeamExperts } = load("lib/team-experts.ts", {
    "@/lib/pb": { __esModule: true, default: { baseURL: "https://example.test", collection: name => name } },
    "@/lib/bounded-records": { boundedFullList: async name => {
      if (name === "experts_public") return records
      assert.equal(name, "expert_roles_public", "public visitors must not need private role access")
      return roles
    } },
    "./allocation-role-groups": groups,
    "./expert-display-order": { readExpertOrder: async () => [], applyExpertOrder: rows => rows },
  })
  const experts = await getTeamExperts({ all: true, throwOnError: true })
  assert.equal(experts.length, 3)
  assert.deepEqual(experts.filter(expert => expert.specialistCategoryIds.includes("education")).map(expert => expert.id), ["teacher"])
  assert.deepEqual(experts.filter(expert => expert.specialistCategoryIds.includes("medical")).map(expert => expert.id), ["teacher"])
  assert.deepEqual(experts.filter(expert => expert.specialistCategoryIds.includes("special-needs")).map(expert => expert.id), ["therapist"])
  assert.deepEqual(experts.find(expert => expert.id === "unassigned").specialistCategoryIds, [])
})

test("public view migration preserves existing fields and active expert restriction", () => {
  let up
  const view = { viewQuery: "SELECT expert_profiles.id, users.name FROM expert_profiles JOIN users ON users.id = expert_profiles.user WHERE users.role = 'expert' AND users.is_active = true" }
  let saves = 0
  vm.runInNewContext(fs.readFileSync("pb_migrations/1792800100_public_expert_role_filter.js", "utf8"), {
    migrate: fn => { up = fn },
  })
  const app = { findCollectionByNameOrId: () => view, save: () => { saves++ } }
  up(app)
  up(app)
  assert.equal(saves, 1)
  assert.match(view.viewQuery, /users\.name , expert_profiles\.specialist_roles FROM/)
  assert.match(view.viewQuery, /users\.is_active = true/)
  assert.doesNotMatch(view.viewQuery, /tool_types|email|contact_number/)
})

test("missing public role view falls back to an accessible legacy catalog", async () => {
  const { getTeamExperts } = load("lib/team-experts.ts", {
    "@/lib/pb": { __esModule: true, default: { baseURL: "https://example.test", collection: name => name } },
    "@/lib/bounded-records": { boundedFullList: async name => {
      if (name === "experts_public") return [{ id: "expert", specialist_roles: ["speech"] }]
      if (name === "expert_roles_public") throw { status: 404 }
      assert.equal(name, "roles_management")
      return [{ id: "speech", role_name_en: "Speech-Language Pathologist" }]
    } },
    "./allocation-role-groups": groups,
    "./expert-display-order": { readExpertOrder: async () => [], applyExpertOrder: rows => rows },
  })
  const experts = await getTeamExperts({ all: true, throwOnError: true })
  assert.equal(experts.length, 1)
  assert.deepEqual(experts[0].specialistCategoryIds, ["special-needs"])
})

test("targeted backend repair handles the published category schema without replacing records", async () => {
  const { expertRoleFilterRepair } = await import("../backend/pb/repair-expert-role-filter.mjs")
  const collections = [
    { id: "roles", name: "roles_management", fields: [{ name: "category" }, { name: "order" }] },
    { name: "specialist_role_categories", fields: [{ name: "key" }] },
    { name: "expert_profiles", fields: [{ name: "specialist_roles", collectionId: "roles" }] },
    { name: "experts_public", fields: [{ name: "name" }], viewQuery: "SELECT expert_profiles.id, users.name FROM expert_profiles JOIN users ON expert_profiles.user = users.id WHERE users.role = 'expert' AND users.is_active = true" },
  ]
  const before = JSON.stringify(collections)
  const changes = expertRoleFilterRepair(collections)
  assert.equal(JSON.stringify(collections), before)
  assert.deepEqual(changes.map(item => item.name), ["experts_public", "expert_roles_public"])
  assert.match(changes[0].viewQuery, /expert_profiles.specialist_roles FROM/)
  assert.match(changes[0].viewQuery, /users.is_active = true/)
  assert.match(changes[1].viewQuery, /LEFT JOIN specialist_role_categories c ON r.category = c.id/)
  assert.match(changes[1].viewQuery, /WHEN 'psychology' THEN 'mental-health'/)
  assert.doesNotMatch(changes[1].viewQuery, /tool_types|expert_id/)
  const applied = [...collections.filter(item => !changes.some(change => change.name === item.name)), ...changes]
  assert.deepEqual(expertRoleFilterRepair(applied), [])
})
