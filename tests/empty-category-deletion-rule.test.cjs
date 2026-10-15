const { test } = require("node:test")
const assert = require("node:assert/strict")
const fs = require("node:fs")
const vm = require("node:vm")

test("category migration narrows the existing permission rule without granting new delete access", () => {
  let up, down
  vm.runInNewContext(fs.readFileSync("pb_migrations/1792800400_empty_specialist_category_deletion.js", "utf8"), {
    migrate: (forward, backward) => { up = forward; down = backward },
  })
  const original = '@request.auth.is_active = true && @request.auth.security_permissions:each ?= "settings.delete"'
  const categories = { deleteRule: original }
  const app = {
    findCollectionByNameOrId: name => name === "specialist_role_categories" ? categories : { fields: { getByName: () => ({}) } },
    save: collection => assert.equal(collection, categories),
  }
  up(app)
  assert.equal(categories.deleteRule, `(${original}) && roles_management_via_category.id = ""`)
  const restricted = categories.deleteRule
  up(app)
  assert.equal(categories.deleteRule, restricted)
  down(app)
  assert.equal(categories.deleteRule, restricted)
  categories.deleteRule = null
  up(app)
  assert.equal(categories.deleteRule, null)
})
