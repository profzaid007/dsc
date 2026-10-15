const { test } = require("node:test")
const assert = require("node:assert/strict")
const fs = require("node:fs")
const ts = require("typescript")

function load(file, dependencies, window = {}) {
  const exports = {}
  new Function("exports", "require", "window", ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText)(exports, name => {
    assert.ok(name in dependencies, `Unexpected dependency ${name}`)
    return dependencies[name]
  }, window)
  return exports
}

function store() {
  const requests = []
  const authListeners = []
  const events = {}
  const authStore = { token: "first", isValid: true, record: { is_active: true }, onChange: fn => authListeners.push(fn) }
  let subscribed = false
  const api = load("hooks/usePermissions.ts", {
    react: { useSyncExternalStore(subscribe, getSnapshot) { if (!subscribed) { subscribed = true; subscribe(() => {}) } return getSnapshot() } },
    "@/lib/pb": { __esModule: true, default: { authStore } },
    "@/lib/security": { securityApi: () => new Promise((resolve, reject) => requests.push({ resolve, reject })) },
    "@/lib/security-failure": load("lib/security-failure.ts", {}),
  }, { addEventListener: (name, fn) => { events[name] = fn } })
  return { read: api.usePermissions, requests, authStore, authChanged: () => authListeners.forEach(fn => fn()), events }
}
const settle = () => new Promise(resolve => setImmediate(resolve))

test("switching accounts discards in-flight permissions from the previous account", async () => {
  const s = store()
  assert.equal(s.read().can("users.delete"), false)
  s.authStore.token = "second"
  s.authChanged()
  assert.equal(s.read().isLoading, true)
  s.requests[0].resolve({ permissions: [], is_super_admin: true })
  await settle()
  assert.equal(s.read().can("users.delete"), false)
  s.requests[1].resolve({ permissions: ["cases.read"], is_super_admin: false })
  await settle()
  assert.equal(s.read().can("cases.read"), true)
  assert.equal(s.read().can("users.delete"), false)
})

test("malformed responses fail closed and Retry can recover", async () => {
  const s = store()
  s.read()
  s.requests[0].resolve({ permissions: ["users.delete"], is_super_admin: "true" })
  await settle()
  assert.equal(s.read().failure, "service_error")
  assert.equal(s.read().can("users.delete"), false)
  s.read().refresh()
  s.requests[1].resolve({ permissions: ["cases.read"], is_super_admin: false })
  await settle()
  assert.equal(s.read().error, false)
  assert.equal(s.read().failure, null)
  assert.equal(s.read().can("cases.read"), true)
})

test("service failures revoke cached effective permissions and report the cause", async () => {
  const s = store()
  s.read()
  s.requests[0].resolve({ permissions: [], is_super_admin: true })
  await settle()
  assert.equal(s.read().can("users.delete"), true)
  s.events.focus()
  s.requests[1].reject({ status: 401 })
  await settle()
  assert.equal(s.read().failure, "session_expired")
  assert.equal(s.read().isSuperAdmin, false)
  assert.equal(s.read().can("users.delete"), false)
})

test("deactivating a locally cached account prevents late responses from restoring access", async () => {
  const s = store()
  s.read()
  s.authStore.record.is_active = false
  s.authChanged()
  s.requests[0].resolve({ permissions: [], is_super_admin: true })
  await settle()
  assert.equal(s.read().isLoading, false)
  assert.equal(s.read().isSuperAdmin, false)
  assert.equal(s.read().can("users.delete"), false)
  assert.equal(s.requests.length, 1)
})
