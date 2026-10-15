const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')

function load(file) {
  const exports = {}
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText, { exports })
  return exports
}

test('care foundations use child workflows and entity profiles', () => {
  const { getDashboardPath } = load('lib/dashboard-routes.ts')
  const { portalJourneyHref } = load('lib/portal-journey.ts')
  const { ROLE_PROFILE_COLLECTION } = load('types/account-profile.ts')
  assert.equal(getDashboardPath('care_foundation'), '/dashboard/parent')
  for (const portal of ['1', '2', '4', '5']) {
    assert.equal(portalJourneyHref(portal, 'care_foundation'), '/dashboard/parent/cases')
    assert.equal(portalJourneyHref(portal, undefined, 'care_foundation'), '/register/care_foundation')
  }
  assert.equal(ROLE_PROFILE_COLLECTION.care_foundation, 'organization_profiles')
})

test('migration adds account and portal choices idempotently without changing access rules', () => {
  const role = { values: ['parent', 'organization'] }
  const registration = { values: ['parent', 'organization'] }
  const collections = {
    users: { fields: { getByName: name => { assert.equal(name, 'role'); return role } } },
    portals: { fields: { getByName: name => { assert.equal(name, 'registration_type'); return registration } } },
    lookups: { name: 'lookups' },
  }
  let migration
  const saved = []
  const app = {
    findCollectionByNameOrId: name => { assert.ok(collections[name]); return collections[name] },
    findRecordsByFilter: () => saved.filter(record => record.key === 'care_foundation'),
    save: record => saved.push(record),
  }
  vm.runInNewContext(fs.readFileSync('pb_migrations/1792700000_care_foundation.js', 'utf8'), {
    migrate: up => { migration = up },
    Record: class { set(key, value) { this[key] = value } },
  })
  migration(app)
  migration(app)
  assert.deepEqual(Array.from(role.values), ['parent', 'organization', 'care_foundation'])
  assert.deepEqual(Array.from(registration.values), ['parent', 'organization', 'care_foundation'])
  assert.equal(saved.filter(record => record.key === 'care_foundation').length, 1)
  assert.equal(saved.find(record => record.key === 'care_foundation').label_ar, 'مؤسسة الرعاية')
})
