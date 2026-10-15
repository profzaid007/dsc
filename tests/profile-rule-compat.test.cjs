const { test } = require("node:test")
const assert = require("node:assert/strict")
const fs = require("node:fs")
const vm = require("node:vm")

test("compatible rules keep protected fields immutable and preserve admin/owner guards", async () => {
  const { compatibleProfileUpdateRule } = await import("../backend/pb/profile-rule-compat.mjs")
  const prefix = '@request.auth.role = "admin" || (id = @request.auth.id && '
  const source = prefix + '@request.body.role:changed = false && @request.body.is_active:changed = false)'
  const result = compatibleProfileUpdateRule(source)
  assert.ok(result.startsWith(prefix))
  assert.ok(result.includes('(@request.body.role:isset = false || @request.body.role = role)'))
  assert.ok(result.includes('(@request.body.is_active:isset = false || @request.body.is_active = is_active)'))
  assert.equal(compatibleProfileUpdateRule(result), result)
  assert.equal(compatibleProfileUpdateRule(null), null)
})

test("migration fixes both save stages without altering other rules or records", () => {
  const collections = {
    users: { updateRule: '@request.body.role:changed = false', listRule: 'original' },
    expert_profiles: { updateRule: '@request.body.user:changed = false', listRule: 'original' },
  }
  let up
  let saved = 0
  vm.runInNewContext(fs.readFileSync('pb_migrations/1792800200_profile_update_rule_compat.js', 'utf8'), {
    migrate: callback => { up = callback },
  })
  const app = { findCollectionByNameOrId: name => collections[name], save: () => { saved++ } }
  up(app)
  up(app)
  assert.equal(saved, 2)
  assert.equal(collections.users.listRule, 'original')
  assert.equal(collections.expert_profiles.listRule, 'original')
  assert.equal(collections.expert_profiles.updateRule, '(@request.body.user:isset = false || @request.body.user = user)')
})
