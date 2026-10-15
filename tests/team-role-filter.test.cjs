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
