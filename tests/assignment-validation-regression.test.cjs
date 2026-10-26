const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  vm = require("node:vm")
function validate(specialties, expert = "expert") {
  const values = {
    assigned_expert: expert,
    case: "case",
    specialization: "therapy",
    task_brief: "A sufficiently detailed task brief",
  }
  let continued = 0
  const user = { id: "expert", getString: () => "expert", getBool: () => true }
  const profile = {
    getString: () => specialties,
    getStringSlice: () => [specialties],
  }
  const app = {
    findRecordById: () => user,
    findFirstRecordByFilter: (name) =>
      name === "expert_profiles" ? profile : {},
  }
  const e = {
    record: {
      collection: () => ({ name: "case_tools" }),
      getString: (key) => values[key],
    },
    requestInfo: () => ({ body: values }),
    app,
    next: () => continued++,
  }
  const context = { module: { exports: {} }, BadRequestError: Error }
  vm.runInNewContext(
    fs.readFileSync("pb_hooks/lib/assignment-validation.js", "utf8"),
    context
  )
  context.module.exports(e)
  return continued
}
test("unassigned tasks continue and only comma-separated specialties are accepted", () => {
  assert.equal(validate("", ""), 1)
  assert.equal(validate("assessment, therapy"), 1)
  assert.throws(() => validate('["assessment","therapy"]'), /comma-separated text/)
  assert.throws(() => validate("assessment"), /does not have/)
})
