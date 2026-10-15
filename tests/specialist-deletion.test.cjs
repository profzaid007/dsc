const { test } = require("node:test")
const assert = require("node:assert/strict")
const fs = require("node:fs")
const vm = require("node:vm")
let guard
vm.runInNewContext(fs.readFileSync("pb_hooks/specialist-deletion.pb.js", "utf8"), {
  onRecordDeleteRequest: fn => { guard = fn }, BadRequestError: Error,
})
function deletion(name, linked = {}) {
  let deleted = false
  const event = {
    record: { id: "target", collection: () => ({ name }), getString: () => "Teacher" },
    app: {
      findCollectionByNameOrId: () => ({ fields: { getByName: () => ({}) } }),
      findRecordsByFilter: (collection, filter, sort, limit, offset, params) => {
        assert.equal(limit, 1)
        assert.ok(["target", "Teacher"].includes(params.value))
        return linked[collection + ":" + filter.split(" ")[0]] ? [{ id: "reference" }] : []
      },
    },
    next: () => { deleted = true },
  }
  return { event, deleted: () => deleted }
}
test("a category containing roles cannot be deleted", () => {
  const attempt = deletion("specialist_role_categories", { "roles_management:category": true })
  assert.throws(() => guard(attempt.event), /contains roles/)
  assert.equal(attempt.deleted(), false)
})
test("expert and case references block role deletion, including legacy assignments", () => {
  for (const key of ["expert_profiles:specialist_roles", "case_experts:role_id", "case_experts:role"]) {
    const attempt = deletion("roles_management", { [key]: true })
    assert.throws(() => guard(attempt.event), /Deactivate it instead/)
    assert.equal(attempt.deleted(), false)
  }
})
test("unused categories and roles proceed to normal permission-checked deletion", () => {
  for (const name of ["specialist_role_categories", "roles_management"]) {
    const attempt = deletion(name)
    guard(attempt.event)
    assert.equal(attempt.deleted(), true)
  }
})
test("both backend deployments enforce identical deletion guards", () => {
  assert.equal(fs.readFileSync("pb_hooks/specialist-deletion.pb.js", "utf8"), fs.readFileSync("backend/pb/pb_hooks/specialist-deletion.pb.js", "utf8"))
})
