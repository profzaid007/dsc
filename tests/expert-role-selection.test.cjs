const { test } = require("node:test")
const assert = require("node:assert/strict")
const fs = require("node:fs")
const ts = require("typescript")
const writes = []
const client = { collection: name => ({
  update: async (id, data) => { writes.push({ name, id, data }); return { id } },
  create: async data => { writes.push({ name, data }); return { id: "new-profile" } },
}) }
const hook = {}
new Function("exports", "require", ts.transpileModule(
  fs.readFileSync("hooks/useExpertProfile.ts", "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } }
).outputText)(hook, name => name === "@/lib/pb" ? { __esModule: true, default: client } : name === "@/lib/country-codes" ? { DEFAULT_COUNTRY_CODE: "+962" } : {})

test("profile editing restores expert role choices and defaults older profiles to no selection", () => {
  assert.deepEqual(hook.emptyDraft().specialistRoles, [])
  assert.deepEqual(hook.draftFromProfile({ specialist_roles: ["role-a", "role-b"] }).specialistRoles, ["role-a", "role-b"])
  assert.deepEqual(hook.draftFromProfile({}).specialistRoles, [])
})
test("creating, editing and clearing roles persists IDs without creating case allocations", async () => {
  const draft = { ...hook.emptyDraft(), publicNameAr: "خبير", publicNameEn: "Expert", specialistRoles: ["role-a", "role-b"] }
  await hook.saveExpertProfileFor(draft, "expert")
  assert.deepEqual(JSON.parse(writes.at(-1).data.get("specialist_roles")), ["role-a", "role-b"])
  assert.equal(writes.at(-1).name, "expert_profiles")
  await hook.saveExpertProfileFor({ ...draft, specialistRoles: [] }, "expert", "profile")
  assert.equal(writes.at(-1).id, "profile")
  assert.deepEqual(JSON.parse(writes.at(-1).data.get("specialist_roles")), [])
  assert.equal(writes.some(write => write.name === "case_experts"), false)
})
