const { test, before, after } = require("node:test")
const assert = require("node:assert/strict")
const fs = require("node:fs")
const path = require("node:path")
const os = require("node:os")
const net = require("node:net")
const { spawn, spawnSync } = require("node:child_process")

// Runs only against a disposable local database. No environment credentials,
// configured backend URL, or existing PocketBase data are read.
const root = path.resolve(__dirname, "..")
const binary =
  process.env.SECURITY_TEST_POCKETBASE ||
  path.resolve(root, "../work/pocketbase/pocketbase.exe")
const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "dsc-security-test-"))
let server,
  base,
  logs = "",
  superToken,
  adminToken,
  readerToken,
  expertToken
const password = "SecurityFixture123!"
const ids = {
  super: "superfixture001",
  admin: "adminfixture001",
  reader: "readrfixture001",
  expert: "exprtfixture001",
  customer: "custmfixture001",
  case: "casefixture0001",
  tool: "toolsfixture001",
}
async function request(route, method = "GET", body, token = superToken) {
  const response = await fetch(base + route, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  let data
  try {
    data = await response.json()
  } catch {
    data = null
  }
  return { status: response.status, data }
}
const records = (n) => "/api/collections/" + n + "/records"
async function login(email) {
  const result = await request(
    "/api/collections/users/auth-with-password",
    "POST",
    { identity: email, password },
    null
  )
  assert.equal(result.status, 200, JSON.stringify(result.data))
  return result.data.token
}
async function state() {
  const r = await request("/api/dsc/security/state")
  assert.equal(r.status, 200, JSON.stringify(r.data))
  return r.data
}
async function createRole(key, permissions) {
  const r = await request("/api/dsc/security/roles", "POST", {
    key,
    name_en: key,
    name_ar: "دور تجريبي",
    description: "Integration test",
    is_active: true,
    permissions,
  })
  assert.equal(r.status, 200, JSON.stringify(r.data))
  return (await state()).roles.find((role) => role.key === key)
}
async function assign(id, roles) {
  const r = await request(`/api/dsc/security/users/${id}/roles`, "PUT", {
    roles,
  })
  assert.equal(r.status, 200, JSON.stringify(r.data))
}
before(async () => {
  assert.ok(
    fs.existsSync(binary),
    "Set SECURITY_TEST_POCKETBASE to a PocketBase executable"
  )
  const migrations = path.join(fixture, "migrations")
  fs.mkdirSync(migrations)
  const schema = process.env.SECURITY_TEST_CANONICAL
    ? fs.readFileSync(path.join(root, "backend/pb/pb_schema.json"), "utf8")
    : JSON.stringify(require("../tools/security-base-schema.cjs")(root))
  const bootstrap = `migrate(app => {
    app.importCollectionsByMarshaledJSON(${JSON.stringify(schema)},false);
    const users=app.findCollectionByNameOrId('users');
    const data=${JSON.stringify([
      [ids.super, "super@fixture.test", "super_admin", true],
      [ids.admin, "admin@fixture.test", "admin", true],
      [ids.reader, "reader@fixture.test", "admin", true],
      [ids.expert, "expert@fixture.test", "expert", true],
      [ids.customer, "customer@fixture.test", "individual", true],
    ])};
    for(const [id,email,role,active] of data){const u=new Record(users);u.set('id',id);u.set('email',email);u.set('name',email);u.set('password',${JSON.stringify(password)});u.set('role',role);u.set('is_active',active);app.save(u);}
    const c=new Record(app.findCollectionByNameOrId('cases'));c.set('id',${JSON.stringify(ids.case)});c.set('user',${JSON.stringify(ids.customer)});c.set('name','Fixture case');c.set('notes','Sensitive health notes');app.save(c);
    const tool=new Record(app.findCollectionByNameOrId('tools'));tool.set('id',${JSON.stringify(ids.tool)});tool.set('name_en','Fixture tool');app.save(tool);
  },()=>{});`
  fs.writeFileSync(path.join(migrations, "1780000000_fixture.js"), bootstrap)
  fs.copyFileSync(
    process.env.SECURITY_TEST_BASE_MIGRATION ||
      path.join(root, "pb_migrations/1792900000_security_management.js"),
    path.join(migrations, "1792900000_security_management.js")
  )
  for (const name of [
    "1793600000_expert_submission.js",
    "1793700500_message_subject_recipients.js",
    "1794100000_audit_rule_repairs.js",
    "1794100100_account_registration.js",
    "1794100200_training_enrollment.js",
    "1795100000_general_role_assignment.js",
  ])
    fs.copyFileSync(
      path.join(root, "pb_migrations", name),
      path.join(migrations, name)
    )
  const dataDir = path.join(fixture, "data")
  const migration = spawnSync(
    binary,
    ["migrate", "up", `--dir=${dataDir}`, `--migrationsDir=${migrations}`],
    { encoding: "utf8", windowsHide: true }
  )
  assert.equal(migration.status, 0, migration.stdout + "\n" + migration.stderr)
  const port = await new Promise((resolve) => {
    const s = net.createServer()
    s.listen(0, "127.0.0.1", () => {
      const p = s.address().port
      s.close(() => resolve(p))
    })
  })
  const actualPort = process.env.SECURITY_TEST_PORT
    ? Number(process.env.SECURITY_TEST_PORT)
    : port
  base = "http://127.0.0.1:" + actualPort
  server = spawn(
    binary,
    [
      "serve",
      ...(process.env.SECURITY_TEST_VERBOSE ? ["--dev"] : []),
      `--http=127.0.0.1:${actualPort}`,
      `--dir=${dataDir}`,
      `--migrationsDir=${migrations}`,
      `--hooksDir=${path.join(root, "pb_hooks")}`,
    ],
    { windowsHide: true, stdio: ["ignore", "pipe", "pipe"] }
  )
  server.stdout.on("data", (b) => {
    logs += b.toString()
  })
  server.stderr.on("data", (b) => {
    logs += b.toString()
  })
  let healthy = false
  for (let i = 0; i < 80; i++) {
    try {
      const response = await fetch(base + "/api/health")
      if (response.ok) {
        healthy = true
        break
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 100))
  }
  assert.ok(healthy, logs)
  superToken = await login("super@fixture.test")
  adminToken = await login("admin@fixture.test")
  readerToken = await login("reader@fixture.test")
  expertToken = await login("expert@fixture.test")
})
after(async () => {
  if (process.env.SECURITY_TEST_KEEP_SERVER) {
    console.log("Disposable security preview backend: " + base)
    return
  }
  if (server) {
    server.kill()
    await new Promise((resolve) => {
      if (server.exitCode !== null) resolve()
      else server.once("exit", resolve)
    })
  }
  // Keep disposable fixture and logs for diagnostics; no live DB is modified.
  if (process.env.SECURITY_TEST_VERBOSE) console.log(logs)
})

test("migration preserves administrator access and restricts security administration", async () => {
  const s = await state()
  assert.equal(s.roles.length, 1)
  assert.equal(s.roles[0].key, "administrator")
  assert.equal(s.roles[0].user_count, 2)
  const me = await request("/api/dsc/security/me", "GET", undefined, adminToken)
  assert.ok(me.data.permissions.includes("cases.delete"))
  assert.equal(
    (await request("/api/dsc/security/state", "GET", undefined, adminToken))
      .status,
    200
  )
  assert.equal(
    (await request(records("security_roles"), "GET", undefined, adminToken))
      .status,
    403
  )
  assert.equal(
    (await request("/api/dsc/security/state", "GET", undefined, null)).status,
    401
  )
  assert.equal(
    (await request(records("cases"), "GET", undefined, adminToken)).status,
    200
  )
})
test("read-only staff can read cases but cannot mutate via direct APIs or public fallback", async () => {
  const role = await createRole("case-reader", ["cases.read"])
  await assign(ids.reader, [role.id])
  const me = await request(
    "/api/dsc/security/me",
    "GET",
    undefined,
    readerToken
  )
  assert.deepEqual(me.data.permissions, ["cases.read"])
  const list = await request(records("cases"), "GET", undefined, readerToken)
  assert.equal(list.status, 200)
  assert.equal(list.data.items.length, 1)
  assert.equal(
    (
      await request(
        records("cases") + "/" + ids.case,
        "GET",
        undefined,
        readerToken
      )
    ).status,
    200
  )
  assert.ok(
    [400, 403].includes(
      (
        await request(
          records("cases"),
          "POST",
          { name: "Denied", user: ids.customer },
          readerToken
        )
      ).status
    )
  )
  assert.ok(
    [403, 404].includes(
      (
        await request(
          records("cases") + "/" + ids.case,
          "PATCH",
          { name: "Denied" },
          readerToken
        )
      ).status
    )
  )
  assert.ok(
    [403, 404].includes(
      (
        await request(
          records("cases") + "/" + ids.case,
          "DELETE",
          undefined,
          readerToken
        )
      ).status
    )
  )
  assert.equal(
    (await request(records("tools"), "GET", undefined, readerToken)).status,
    403
  )
  assert.equal(
    (await request("/api/dsc/backups", "GET", undefined, readerToken)).status,
    403
  )
  assert.equal(
    (
      await request(
        `/api/dsc/cases/${ids.case}/allocations`,
        "POST",
        { rows: [] },
        readerToken
      )
    ).status,
    403
  )
})
test("role union, revocation, deactivation, and reactivation apply without login", async () => {
  const extra = await createRole("tool-reader", ["tools.read"])
  const initial = (await state()).roles.find((r) => r.key === "case-reader")
  await assign(ids.reader, [initial.id, extra.id])
  assert.equal(
    (await request(records("tools"), "GET", undefined, readerToken)).status,
    200
  )
  const edit = await request("/api/dsc/security/roles/" + extra.id, "PATCH", {
    ...extra,
    is_active: false,
  })
  assert.equal(edit.status, 200, JSON.stringify(edit.data))
  assert.equal(
    (await request(records("tools"), "GET", undefined, readerToken)).status,
    403
  )
  await request("/api/dsc/security/roles/" + extra.id, "PATCH", {
    ...extra,
    is_active: true,
  })
  assert.equal(
    (await request(records("tools"), "GET", undefined, readerToken)).status,
    200
  )
  await assign(ids.reader, [])
  assert.equal(
    (await request(records("cases"), "GET", undefined, readerToken)).status,
    403
  )
})
test("any account can receive roles; delegation is limited to the actor's capacity", async () => {
  const role = await createRole("delegation-reader", ["cases.read"])
  for (const id of [ids.expert, ids.customer]) {
    await assign(id, [role.id])
    const token =
      id === ids.expert ? expertToken : await login("customer@fixture.test")
    assert.deepEqual(
      (await request("/api/dsc/security/me", "GET", undefined, token)).data
        .permissions,
      ["cases.read"]
    )
    assert.equal(
      (await request(records("cases"), "GET", undefined, token)).status,
      200
    )
    assert.equal(
      (await request(records("users") + "/" + id)).data.role,
      id === ids.expert ? "expert" : "individual"
    )
    await assign(id, [])
  }
  const delegated = await createRole("delegator", [
    "security.read",
    "security.assign_roles",
    "cases.read",
  ])
  await assign(ids.reader, [delegated.id])
  assert.equal(
    (
      await request(
        "/api/dsc/security/users/" + ids.expert + "/roles",
        "PUT",
        { roles: [role.id] },
        readerToken
      )
    ).status,
    200
  )
  const administrator = (await state()).roles.find(
    (r) => r.key === "administrator"
  )
  assert.equal(
    (
      await request(
        "/api/dsc/security/users/" + ids.expert + "/roles",
        "PUT",
        { roles: [administrator.id] },
        readerToken
      )
    ).status,
    403
  )
  assert.equal(
    (
      await request(
        "/api/dsc/security/users/" + ids.expert + "/roles",
        "PUT",
        { roles: [administrator.id] },
        adminToken
      )
    ).status,
    200
  )
  assert.equal(
    (
      await request("/api/dsc/security/me", "GET", undefined, expertToken)
    ).data.permissions.includes("security.assign_roles"),
    true
  )
  assert.equal(
    (
      await request(
        "/api/dsc/security/users/" + ids.expert + "/roles",
        "PUT",
        { roles: [] },
        readerToken
      )
    ).status,
    403
  )
  await assign(ids.expert, [])
  assert.equal(
    (
      await request(
        "/api/dsc/security/users/" + ids.customer + "/roles",
        "PUT",
        { roles: [role.id] },
        expertToken
      )
    ).status,
    403
  )
  await assign(ids.reader, [
    (await state()).roles.find((r) => r.key === "case-reader").id,
  ])
})

test("invalid grants, arbitrary role assignments, and deleting assigned/system roles are denied", async () => {
  const body = {
    key: "invalid-role",
    name_en: "Bad",
    name_ar: "",
    description: "",
    is_active: true,
  }
  assert.equal(
    (
      await request("/api/dsc/security/roles", "POST", {
        ...body,
        permissions: ["cases.delete"],
      })
    ).status,
    400
  )
  assert.equal(
    (
      await request("/api/dsc/security/roles", "POST", {
        ...body,
        permissions: ["security.manage"],
      })
    ).status,
    400
  )
  const s = await state()
  const system = s.roles.find((r) => r.is_system)
  assert.equal(
    (await request("/api/dsc/security/roles/" + system.id, "DELETE")).status,
    400
  )
  const role = s.roles.find((r) => r.key === "case-reader")
  await assign(ids.reader, [role.id])
  assert.equal(
    (await request("/api/dsc/security/roles/" + role.id, "DELETE")).status,
    400
  )
  assert.equal(
    (
      await request(`/api/dsc/security/users/${ids.customer}/roles`, "PUT", {
        roles: [role.id],
      })
    ).status,
    200
  )
  await assign(ids.customer, [])
  assert.equal(
    (
      await request(
        `/api/dsc/security/users/${ids.admin}/roles`,
        "PUT",
        { roles: [role.id] },
        adminToken
      )
    ).status,
    200
  )
  await assign(ids.admin, [system.id])
  const unused = await createRole("unused-role", [])
  assert.equal(
    (await request("/api/dsc/security/roles/" + unused.id, "DELETE")).status,
    200
  )
})
test("native account writes cannot escalate permissions or remove own Super Admin", async () => {
  const route = records("users") + "/" + ids.admin
  assert.ok(
    [400, 403, 404].includes(
      (
        await request(
          route,
          "PATCH",
          { security_permissions: ["users.delete"] },
          adminToken
        )
      ).status
    )
  )
  assert.ok(
    [403, 404].includes(
      (await request(route, "PATCH", { role: "super_admin" }, adminToken))
        .status
    )
  )
  assert.equal(
    (
      await request(records("users") + "/" + ids.super, "PATCH", {
        is_active: false,
      })
    ).status,
    400
  )
  assert.equal(
    (await request(records("users") + "/" + ids.super, "DELETE")).status,
    400
  )
  assert.equal(
    (
      await request(records("users") + "/" + ids.super, "PATCH", {
        role: "admin",
      })
    ).status,
    400
  )
  assert.equal(
    (await request(route, "PATCH", { is_active: false })).status,
    200
  )
  assert.equal(
    (await request("/api/dsc/security/me", "GET", undefined, adminToken))
      .status,
    403
  )
  assert.equal((await request(route, "PATCH", { is_active: true })).status, 200)
  assert.equal(
    (await request(records("cases"), "GET", undefined, adminToken)).status,
    200
  )
})
test("customer ownership, public reads and pending expert registration remain scoped", async () => {
  const customerToken = await login("customer@fixture.test")
  assert.equal(
    (
      await request(
        records("cases") + "/" + ids.case,
        "GET",
        undefined,
        customerToken
      )
    ).status,
    200
  )
  assert.equal(
    (await request(records("settings"), "GET", undefined, null)).status,
    200
  )
  assert.equal(
    (
      await request(
        records("cases") + "/" + ids.case,
        "GET",
        undefined,
        expertToken
      )
    ).status,
    404
  )
  const form = new FormData()
  form.set("email", "pending@fixture.test")
  form.set("password", password)
  form.set("passwordConfirm", password)
  form.set("submission_key", "security-fixture-pending-123")
  form.set(
    "profile",
    JSON.stringify({
      public_name_en: "Pending expert",
      public_name_ar: "خبير تجريبي",
      specialist_roles: [],
      age_group: [],
    })
  )
  const created = await fetch(base + "/api/dsc/expert-register", {
    method: "POST",
    body: form,
  })
  const create = { status: created.status, data: await created.json() }
  assert.equal(create.status, 200, JSON.stringify(create.data))
  const pending = await login("pending@fixture.test")
  assert.equal(
    (await request(records("cases"), "GET", undefined, pending)).status,
    403
  )
})
test("audit is immutable, records successful changes, and paginates", async () => {
  const result = await request("/api/dsc/security/audit?page=1")
  assert.equal(result.status, 200, JSON.stringify(result.data))
  assert.ok(result.data.totalItems > 5)
  assert.ok(result.data.items.some((r) => r.action === "role.create"))
  assert.ok(
    result.data.items.every((r) => !JSON.stringify(r).includes(password))
  )
  assert.equal(
    (await request(records("security_audit_log"), "POST", { action: "forged" }))
      .status,
    403
  )
  assert.equal((await request("/api/dsc/security/audit?page=-1")).status, 400)
})
test("payment grants are enforced independently of case editing and hide clinical data", async () => {
  const writer = await createRole("case-writer", ["cases.read", "cases.update"])
  await assign(ids.reader, [writer.id])
  const deny = await request(
    records("cases") + "/" + ids.case,
    "PATCH",
    { payment_amount: 150 },
    readerToken
  )
  assert.equal(deny.status, 403, JSON.stringify(deny.data))
  const normal = await request(
    records("cases") + "/" + ids.case,
    "GET",
    undefined,
    readerToken
  )
  assert.equal(normal.status, 200)
  assert.equal("payment_amount" in normal.data, false)
  assert.equal(
    (await request("/api/dsc/payments", "GET", undefined, readerToken)).status,
    403
  )
  const finance = await createRole("finance-staff", [
    "payments.read",
    "payments.update",
  ])
  await assign(ids.reader, [finance.id])
  const list = await request("/api/dsc/payments", "GET", undefined, readerToken)
  assert.equal(list.status, 200, JSON.stringify(list.data))
  assert.equal(list.data.length, 1)
  assert.equal("notes" in list.data[0], false)
  const native = await request(
    records("cases") + "/" + ids.case,
    "GET",
    undefined,
    readerToken
  )
  assert.equal(native.status, 200)
  assert.equal("notes" in native.data, false)
  const amount = await request(
    "/api/dsc/payments/" + ids.case,
    "PATCH",
    { action: "set_amount", amount: 150 },
    readerToken
  )
  assert.equal(amount.status, 200, JSON.stringify(amount.data))
  assert.equal(amount.data.payment_amount, 150)
  assert.equal(
    (await request("/api/dsc/payments/export", "GET", undefined, readerToken))
      .status,
    403
  )
  assert.equal(
    (
      await request(
        "/api/dsc/payments/" + ids.case,
        "PATCH",
        { action: "set_amount", amount: -10 },
        readerToken
      )
    ).status,
    400
  )
  const approve = await request(
    "/api/dsc/payments/" + ids.case,
    "PATCH",
    { action: "approve" },
    readerToken
  )
  assert.equal(approve.status, 200)
  assert.equal(approve.data.is_paid, true)
})
test("expert approval works with its own grant and only exposes expert user records", async () => {
  const role = await createRole("expert-reviewer", [
    "experts.read",
    "experts.approve",
  ])
  await assign(ids.reader, [role.id])
  const list = await request(records("users"), "GET", undefined, readerToken)
  assert.equal(list.status, 200)
  assert.ok(list.data.items.length > 0)
  assert.ok(list.data.items.every((u) => u.role === "expert"))
  const pending = list.data.items.find((u) => !u.is_active)
  assert.ok(pending)
  const approval = await request(
    `/api/dsc/security/experts/${pending.id}/approve`,
    "POST",
    {},
    readerToken
  )
  assert.equal(approval.status, 200, JSON.stringify(approval.data))
  assert.equal(
    (
      await request(
        `/api/dsc/security/experts/${ids.customer}/approve`,
        "POST",
        {},
        readerToken
      )
    ).status,
    400
  )
  assert.ok(
    [403, 404].includes(
      (
        await request(
          records("users") + "/" + ids.customer,
          "PATCH",
          { is_active: false },
          readerToken
        )
      ).status
    )
  )
  assert.equal(
    (
      await request("/api/dsc/security/roles/" + role.id, "PATCH", {
        ...role,
        permissions: [...role.permissions, "experts.update"],
      })
    ).status,
    200
  )
  assert.equal(
    (
      await request(
        records("users") + "/" + pending.id,
        "PATCH",
        { name: "Reviewed expert name" },
        readerToken
      )
    ).status,
    200
  )
})
test("protected files require both a valid file token and current permission", async () => {
  const body = new FormData()
  body.set(
    "payment_slip",
    new Blob(["fixture receipt"], { type: "text/plain" }),
    "receipt.txt"
  )
  const upload = await fetch(base + records("cases") + "/" + ids.case, {
    method: "PATCH",
    headers: { Authorization: superToken },
    body,
  })
  assert.equal(upload.status, 200)
  const record = await upload.json()
  const url = base + "/api/files/cases/" + ids.case + "/" + record.payment_slip
  assert.ok([403, 404].includes((await fetch(url)).status))
  const role = await createRole("receipt-reader", ["payments.read"])
  await assign(ids.reader, [role.id])
  const token = await request("/api/files/token", "POST", {}, readerToken)
  assert.equal(token.status, 200)
  assert.equal((await fetch(url + "?token=" + token.data.token)).status, 200)
  await assign(ids.reader, [])
  assert.ok(
    [403, 404].includes(
      (await fetch(url + "?token=" + token.data.token)).status
    )
  )
})
test("event record rules distinguish training from lecture grants", async () => {
  const training = await request(records("event_registrations"), "POST", {
    program_id: "training-fixture",
    user_name: "Training attendee",
  })
  const lecture = await request(records("event_registrations"), "POST", {
    lecture_id: "lecture-fixture",
    user_name: "Lecture attendee",
  })
  assert.equal(training.status, 400)
  assert.equal(lecture.status, 200)
  const role = await createRole("lecture-reader", ["lectures.read"])
  await assign(ids.reader, [role.id])
  const list = await request(
    records("event_registrations"),
    "GET",
    undefined,
    readerToken
  )
  assert.equal(list.status, 200)
  assert.equal(list.data.items.length, 1)
  assert.equal(list.data.items[0].id, lecture.data.id)
})
test("allocation replacement enforces create, update and delete independently", async () => {
  const category = await request(
    records("specialist_role_categories"),
    "POST",
    { key: "medical", name_en: "Medicine", name_ar: "الطب" }
  )
  assert.equal(category.status, 200, JSON.stringify(category.data))
  const specialist = await request(records("roles_management"), "POST", {
    role_name_en: "Fixture physician",
    role_group: "medical",
    role_name_ar: "طبيب تجريبي",
  })
  assert.equal(specialist.status, 200, JSON.stringify(specialist.data))
  const role = await createRole("allocation-creator", [
    "allocations.read",
    "allocations.create",
  ])
  await assign(ids.reader, [role.id])
  const url = `/api/dsc/cases/${ids.case}/allocations`
  const add = await request(
    url,
    "POST",
    { rows: [{ expert_id: ids.expert, role_id: specialist.data.id }] },
    readerToken
  )
  assert.equal(add.status, 200, JSON.stringify(add.data))
  assert.equal(
    (await request(url, "POST", { rows: [] }, readerToken)).status,
    403
  )
  const list = await request(
    records("case_experts"),
    "GET",
    undefined,
    readerToken
  )
  assert.equal(list.status, 200)
  assert.equal(list.data.items.length, 1)
  const foreign = await request(
    url,
    "POST",
    {
      rows: [
        {
          id: "foreignrecord01",
          expert_id: ids.expert,
          role_id: specialist.data.id,
        },
      ],
    },
    readerToken
  )
  assert.equal(foreign.status, 400)
  // A no-op save does not require Update permission.
  const unchanged = await request(
    url,
    "POST",
    {
      rows: [
        {
          id: list.data.items[0].id,
          expert_id: ids.expert,
          role_id: specialist.data.id,
        },
      ],
    },
    readerToken
  )
  assert.equal(unchanged.status, 200)
})
test("realtime subscriptions do not deliver protected records after role revocation", async () => {
  const role = (await state()).roles.find((r) => r.key === "case-reader")
  await assign(ids.reader, [role.id])
  const controller = new AbortController()
  const connection = await fetch(base + "/api/realtime", {
    signal: controller.signal,
  })
  const stream = connection.body.getReader()
  const decoder = new TextDecoder()
  let buffer = "",
    clientId = "",
    events = []
  const pump = (async () => {
    try {
      while (true) {
        const { value, done } = await stream.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        let boundary
        while ((boundary = buffer.indexOf("\n\n")) >= 0) {
          const event = buffer.slice(0, boundary)
          buffer = buffer.slice(boundary + 2)
          const data = event
            .split("\n")
            .find((line) => line.startsWith("data:"))
          if (!data) continue
          const payload = JSON.parse(data.slice(5))
          if (payload.clientId) clientId = payload.clientId
          else events.push(payload)
        }
      }
    } catch {}
  })()
  const until = async (predicate) => {
    for (let i = 0; i < 100; i++) {
      if (predicate()) return
      await new Promise((r) => setTimeout(r, 20))
    }
    assert.fail("Realtime event timed out")
  }
  try {
    await until(() => clientId)
    const subscribe = await request(
      "/api/realtime",
      "POST",
      { clientId, subscriptions: ["cases/*"] },
      readerToken
    )
    assert.equal(subscribe.status, 204)
    await request(records("cases") + "/" + ids.case, "PATCH", {
      name: "Realtime before revocation",
    })
    await until(() =>
      events.some(
        (e) => e.record && e.record.name === "Realtime before revocation"
      )
    )
    await assign(ids.reader, [])
    await request(records("cases") + "/" + ids.case, "PATCH", {
      name: "Realtime after revocation",
    })
    await new Promise((r) => setTimeout(r, 300))
    assert.equal(
      events.some(
        (e) => e.record && e.record.name === "Realtime after revocation"
      ),
      false
    )
  } finally {
    controller.abort()
    await pump
  }
})
test("user deletion includes linked profiles atomically without unrelated module grants", async () => {
  const account = await request(records("users"), "POST", {
    email: "deletable@fixture.test",
    password,
    passwordConfirm: password,
    name: "Deletable account",
    role: "individual",
    is_active: true,
  })
  assert.equal(account.status, 200)
  const profile = await request(records("individual_profiles"), "POST", {
    user: account.data.id,
  })
  assert.equal(profile.status, 200)
  const role = await createRole("user-deleter", ["users.read", "users.delete"])
  await assign(ids.reader, [role.id])
  const check = await request(
    `/api/dsc/security/users/${account.data.id}/deletion-check`,
    "GET",
    undefined,
    readerToken
  )
  assert.equal(check.status, 200)
  assert.deepEqual(check.data, { cases: 0, assignments: 0 })
  assert.equal(
    (
      await request(
        records("users") + "/" + account.data.id,
        "DELETE",
        undefined,
        readerToken
      )
    ).status,
    204
  )
  assert.equal(
    (await request(records("individual_profiles") + "/" + profile.data.id))
      .status,
    404
  )
  assert.equal(
    (
      await request(
        records("users") + "/" + ids.customer,
        "DELETE",
        undefined,
        readerToken
      )
    ).status,
    400
  )
  assert.equal((await request(records("cases") + "/" + ids.case)).status, 200)
})
test("password resets require the dedicated permission in addition to user update", async () => {
  const role = await createRole("user-editor", ["users.read", "users.update"])
  await assign(ids.reader, [role.id])
  const reset = {
    password: "ChangedFixture456!",
    passwordConfirm: "ChangedFixture456!",
  }
  assert.ok(
    [400, 403].includes(
      (
        await request(
          records("users") + "/" + ids.customer,
          "PATCH",
          reset,
          readerToken
        )
      ).status
    )
  )
  const permitted = await request(
    "/api/dsc/security/roles/" + role.id,
    "PATCH",
    { ...role, permissions: [...role.permissions, "users.reset_password"] }
  )
  assert.equal(permitted.status, 200)
  assert.equal(
    (
      await request(
        records("users") + "/" + ids.customer,
        "PATCH",
        reset,
        readerToken
      )
    ).status,
    200
  )
  assert.equal(
    (
      await request(
        records("users") + "/" + ids.admin,
        "PATCH",
        reset,
        readerToken
      )
    ).status,
    403
  )
})
test("concurrent privileged-account edits leave an active Super Admin", async () => {
  const create = await request(records("users"), "POST", {
    email: "second-super@fixture.test",
    password,
    passwordConfirm: password,
    name: "Second Super Admin",
    role: "super_admin",
    is_active: true,
  })
  assert.equal(create.status, 200, JSON.stringify(create.data))
  const secondId = create.data.id
  const secondToken = await login("second-super@fixture.test")
  const results = await Promise.all([
    request(
      records("users") + "/" + secondId,
      "PATCH",
      { role: "admin" },
      superToken
    ),
    request(
      records("users") + "/" + ids.super,
      "PATCH",
      { role: "admin" },
      secondToken
    ),
  ])
  assert.ok(results.filter((r) => r.status === 200).length <= 1)
  const survivor = results[1].status === 200 ? secondToken : superToken
  const list = await request(records("users"), "GET", undefined, survivor)
  assert.equal(list.status, 200)
  assert.ok(
    list.data.items.some((u) => u.role === "super_admin" && u.is_active)
  )
  // Restore the original fixture owner for optional browser preview sessions.
  if (results[1].status === 200)
    assert.equal(
      (
        await request(
          records("users") + "/" + ids.super,
          "PATCH",
          { role: "super_admin" },
          secondToken
        )
      ).status,
      200
    )
})

test("expert name saves accept ordinary changes while permission-field writes stay denied", async () => {
  const route = records("users") + "/" + ids.expert
  const saved = await request(
    route,
    "PATCH",
    { name: "Updated expert name" },
    expertToken
  )
  assert.equal(saved.status, 200, JSON.stringify(saved.body))
  const denied = await request(
    route,
    "PATCH",
    { security_permissions: ["users.delete"] },
    expertToken
  )
  assert.ok([400, 403, 404].includes(denied.status))
})

test("training-only grants manage enrollment without access to clinical cases", async () => {
  const program = await request(records("programs"), "POST", {
    name: { en: "Enrollment fixture", ar: "تجربة" },
    status: "published",
    is_public: true,
    max_participants: 3,
  })
  assert.equal(program.status, 200, JSON.stringify(program.data))
  const customer = await request(records("users"), "POST", {
    email: "training-owner@fixture.test",
    password,
    passwordConfirm: password,
    name: "Training owner",
    role: "individual",
    is_active: true,
  })
  assert.equal(customer.status, 200, JSON.stringify(customer.data))
  const owner = await login("training-owner@fixture.test")
  const enrollment = await request(
    `/api/dsc/programs/${program.data.id}/enroll`,
    "POST",
    {},
    owner
  )
  assert.equal(enrollment.status, 200, JSON.stringify(enrollment.data))
  const role = await createRole("training-only", [
    "training.read",
    "training.update",
  ])
  await assign(ids.reader, [role.id])
  assert.equal(
    (await request(records("cases"), "GET", undefined, readerToken)).status,
    403
  )
  const list = await request(
    "/api/dsc/training-registrations",
    "GET",
    undefined,
    readerToken
  )
  assert.equal(list.status, 200, JSON.stringify(list.data))
  assert.ok(list.data.items.some((r) => r.id === enrollment.data.id))
  assert.ok(
    list.data.items.every(
      (r) => !Object.hasOwn(r, "notes") && !Object.hasOwn(r, "case_details")
    )
  )
  const edit = await request(
    `/api/dsc/training-registrations/${enrollment.data.id}`,
    "PATCH",
    { status: "attended" },
    readerToken
  )
  assert.equal(edit.status, 200, JSON.stringify(edit.data))
  assert.equal(
    (
      await request(
        `/api/dsc/training-registrations/${enrollment.data.id}`,
        "DELETE",
        undefined,
        readerToken
      )
    ).status,
    403
  )
  const outsider = await request(
    "/api/dsc/training-registrations?user=" + ids.reader,
    "GET",
    undefined,
    owner
  )
  assert.equal(outsider.status, 200)
  assert.equal(outsider.data.items.length, 0)
})
