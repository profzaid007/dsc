const { test } = require("node:test")
const assert = require("node:assert/strict")
const fs = require("node:fs")
const ts = require("typescript")
const writes = []
const client = {
  collection: (name) => ({
    update: async (id, data) => {
      writes.push({ name, id, data })
      return { id }
    },
    create: async (data) => {
      writes.push({ name, data })
      return { id: "new-profile" }
    },
  }),
}
const lists = {}
new Function("exports", ts.transpileModule(fs.readFileSync("lib/expert-list-fields.ts", "utf8"), {compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(lists)
const hook = {}
new Function(
  "exports",
  "require",
  ts.transpileModule(fs.readFileSync("hooks/useExpertProfile.ts", "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText
)(hook, (name) =>
  name === "@/lib/expert-list-fields" ? lists : name === "@/lib/pb"
    ? { __esModule: true, default: client }
    : name === "@/lib/country-codes"
      ? { DEFAULT_COUNTRY_CODE: "+962" }
      : {}
)

test("profile editing restores expert role choices and defaults older profiles to no selection", () => {
  assert.deepEqual(hook.emptyDraft().specialistRoles, [])
  assert.deepEqual(
    hook.draftFromProfile({ specialist_roles: ["role-a", "role-b"] })
      .specialistRoles,
    ["role-a", "role-b"]
  )
  assert.deepEqual(hook.draftFromProfile({}).specialistRoles, [])
})
test("creating, editing and clearing roles persists IDs without creating case allocations", async () => {
  const draft = {
    ...hook.emptyDraft(),
    publicNameAr: "خبير",
    publicNameEn: "Expert",
    specialistRoles: ["role-a", "role-b"],
  }
  await hook.saveExpertProfileFor(draft, "expert")
  assert.deepEqual(JSON.parse(writes.at(-1).data.get("specialist_roles")), [
    "role-a",
    "role-b",
  ])
  assert.equal(writes.at(-1).name, "expert_profiles")
  await hook.saveExpertProfileFor(
    { ...draft, specialistRoles: [] },
    "expert",
    "profile"
  )
  assert.equal(writes.at(-1).id, "profile")
  assert.equal(writes.at(-1).data.get("age_group"), "")
  assert.deepEqual(JSON.parse(writes.at(-1).data.get("specialist_roles")), [])
  assert.equal(
    writes.some((write) => write.name === "case_experts"),
    false
  )
})

test("cleared public names remain empty when reopening the profile", () => {
  const draft = hook.draftFromProfile(
    { public_name_ar: "", public_name_en: "Expert" },
    "اسم الحساب"
  )
  assert.equal(draft.publicNameAr, "")
  assert.equal(draft.publicNameEn, "Expert")
  assert.equal(
    hook.draftFromProfile({ public_name_en: "" }, "Account").publicNameEn,
    ""
  )
})

test("saving requires both names and rejects missing names before any database writes", async () => {
  const draft = {
    ...hook.emptyDraft(),
    publicNameEn: "Expert",
    publicNameAr: "خبير",
  }
  for (const invalid of [
    { ...draft, publicNameAr: "" },
    { ...draft, publicNameEn: "   " },
    { ...draft, publicNameAr: "", publicNameEn: "" },
  ]) {
    const count = writes.length
    await assert.rejects(
      () => hook.saveExpertProfileFor(invalid, "expert", "profile"),
      /Both Arabic and English/
    )
    assert.equal(writes.length, count)
  }
  await hook.saveExpertProfileFor(draft, "expert", "profile")
  assert.equal(writes.at(-1).data.get("public_name_ar"), "خبير")
  assert.equal(writes.at(-1).data.get("public_name_en"), "Expert")
})
