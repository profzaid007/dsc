const test = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  path = require("node:path"),
  os = require("node:os"),
  net = require("node:net")
const { spawn, spawnSync } = require("node:child_process")
test("audit repairs: atomic registration, permissions, publication and concurrent enrollment", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "dsc-audit-repair-"))
  const migrations = path.join(dir, "migrations")
  fs.mkdirSync(migrations)
  const schema = fs.readFileSync("backend/pb/pb_schema.json", "utf8")
  fs.writeFileSync(
    path.join(migrations, "1780000000_fixture.js"),
    `migrate(app=>{
 app.importCollectionsByMarshaledJSON(${JSON.stringify(schema)},false);
 const users=app.findCollectionByNameOrId('users');const u=new Record(users);u.set('id','auditadmin00001');u.set('email','admin@audit.test');u.set('password','TestPassword123!');u.set('name','Admin');u.set('role','super_admin');u.set('is_active',true);app.save(u);
 const p=new Record(app.findCollectionByNameOrId('programs'));p.set('id','auditprogram001');p.set('name',{en:'Training',ar:'تدريب'});p.set('is_public',true);p.set('status','published');p.set('max_participants',1);app.save(p);
 const lecture=new Record(app.findCollectionByNameOrId('public_lectures'));lecture.set('title',{en:'Draft',ar:'مسودة'});lecture.set('is_public',true);lecture.set('status','draft');app.save(lecture);
 });`
  )
  for (const name of [
    "1794100000_audit_rule_repairs.js",
    "1794100100_account_registration.js",
    "1794100200_training_enrollment.js",
    "1794100300_messaging_quotas.js",
  ])
    fs.copyFileSync("pb_migrations/" + name, path.join(migrations, name))
  const binary = path.resolve("../work/pocketbase-0.31.0/pocketbase.exe")
  const args = ["--dir", path.join(dir, "data"), "--migrationsDir", migrations]
  const migrated = spawnSync(binary, ["migrate", "up", ...args], {
    encoding: "utf8",
    windowsHide: true,
  })
  assert.equal(migrated.status, 0, migrated.stdout + migrated.stderr)
  const port = await new Promise((resolve) => {
    const s = net.createServer()
    s.listen(0, "127.0.0.1", () => {
      const p = s.address().port
      s.close(() => resolve(p))
    })
  })
  const server = spawn(
    binary,
    [
      "serve",
      ...args,
      "--hooksDir",
      path.resolve("pb_hooks"),
      "--http",
      `127.0.0.1:${port}`,
    ],
    { windowsHide: true }
  )
  let logs = ""
  server.stdout.on("data", (x) => (logs += x))
  server.stderr.on("data", (x) => (logs += x))
  const base = `http://127.0.0.1:${port}`
  const req = async (url, method = "GET", body, token) => {
    const r = await fetch(base + url, {
      method,
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: "Bearer " + token } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    })
    return { status: r.status, data: r.status === 204 ? null : await r.json() }
  }
  const pass = "TestPassword123!"
  const login = async (email) => {
    const r = await req("/api/collections/users/auth-with-password", "POST", {
      identity: email,
      password: pass,
    })
    assert.equal(r.status, 200, JSON.stringify(r))
    return r.data.token
  }
  const registration = (email, key, extra = {}) => ({
    submission_key: key,
    user: {
      email,
      name: "Example",
      password: pass,
      passwordConfirm: pass,
      role: "individual",
      contact_number: "+962780123456",
    },
    profile: { collection: "individual_profiles", gender: "male" },
    cases: [],
    ...extra,
  })
  try {
    for (let i = 0; i < 100; i++) {
      try {
        if ((await fetch(base + "/api/health")).ok) break
      } catch {}
      await new Promise((r) => setTimeout(r, 30))
    }
    assert.equal(server.exitCode, null, logs)
    const admin = await login("admin@audit.test")
    const invalid = registration(
      "invalid@audit.test",
      "invalid-registration-123"
    )
    invalid.profile.gender = "invalid"
    assert.equal((await req("/api/dsc/register", "POST", invalid)).status, 400)
    assert.equal(
      (
        await req(
          "/api/collections/users/records?filter=" +
            encodeURIComponent('email="invalid@audit.test"'),
          "GET",
          null,
          admin
        )
      ).data.totalItems,
      0
    )
    const rollback = registration(
      "rollback@audit.test",
      "rollback-registration-123"
    )
    rollback.profile.notes = "x".repeat(5001)
    assert.equal((await req("/api/dsc/register", "POST", rollback)).status, 400)
    assert.equal(
      (
        await req(
          "/api/collections/users/records?filter=" +
            encodeURIComponent('email="rollback@audit.test"'),
          "GET",
          null,
          admin
        )
      ).data.totalItems,
      0
    )
    for (const role of ["parent", "organization", "care_foundation"]) {
      const data = registration(
        role + "@audit.test",
        role.replace("_", "-") + "-registration-123456"
      )
      data.user.role = role
      data.profile = {
        collection:
          role === "parent" ? "parent_profiles" : "organization_profiles",
        organization_name: "Organization",
      }
      if (role === "parent")
        data.cases = [
          {
            name: "Child",
            date_of_birth: "2010-01-01",
            gender: "male",
            relationship: "Father",
            portal_type: "Support",
            service_type: "Assessment",
          },
        ]
      assert.equal(
        (await req("/api/dsc/register", "POST", data)).status,
        200,
        role
      )
    }
    for (let i = 0; i < 5; i++)
      assert.equal(
        (
          await req("/api/dsc/messaging-quota", "POST", {
            scope: "client",
            identity: "a".repeat(64),
          })
        ).status,
        200
      )
    assert.equal(
      (
        await req("/api/dsc/messaging-quota", "POST", {
          scope: "client",
          identity: "a".repeat(64),
        })
      ).status,
      429
    )
    assert.equal(
      (
        await req("/api/dsc/messaging-quota", "POST", {
          scope: "client",
          identity: "b".repeat(64),
        })
      ).status,
      200
    )
    const payload = registration("one@audit.test", "first-registration-12345")
    const first = await req("/api/dsc/register", "POST", payload)
    assert.equal(first.status, 200, JSON.stringify(first))
    const again = await req("/api/dsc/register", "POST", payload)
    assert.equal(again.status, 200, JSON.stringify(again))
    assert.equal(again.data.id, first.data.id)
    const guest = registration("guest@audit.test", "guest-enrollment-123456", {
      program_id: "auditprogram001",
    })
    const guestResult = await req("/api/dsc/register", "POST", guest)
    assert.equal(guestResult.status, 200, JSON.stringify(guestResult))
    const guestCases = await req(
      "/api/collections/cases/records?filter=" +
        encodeURIComponent('user="' + guestResult.data.id + '"'),
      "GET",
      null,
      admin
    )
    assert.equal(guestCases.data.totalItems, 1)
    assert.equal(
      (
        await req(
          "/api/collections/cases/records/" + guestCases.data.items[0].id,
          "DELETE",
          null,
          admin
        )
      ).status,
      204
    )
    const token = await login("one@audit.test")
    const profiles = await req(
      "/api/collections/individual_profiles/records",
      "GET",
      null,
      token
    )
    assert.equal(profiles.data.totalItems, 1)
    const second = await req(
      "/api/dsc/register",
      "POST",
      registration("two@audit.test", "second-registration-1234")
    )
    assert.equal(second.status, 200, JSON.stringify(second))
    const token2 = await login("two@audit.test")
    const enrolled = await Promise.all([
      req("/api/dsc/programs/auditprogram001/enroll", "POST", {}, token),
      req("/api/dsc/programs/auditprogram001/enroll", "POST", {}, token2),
    ])
    assert.deepEqual(
      enrolled.map((r) => r.status).sort(),
      [200, 400],
      JSON.stringify(enrolled)
    )
    const winner = enrolled.find((r) => r.status === 200),
      winnerToken = enrolled[0].status === 200 ? token : token2
    const program = await req(
      "/api/collections/programs/records/auditprogram001",
      "GET",
      null,
      admin
    )
    assert.equal(program.data.current_registrations, 1)
    const repeated = await req(
      "/api/dsc/programs/auditprogram001/enroll",
      "POST",
      {},
      winnerToken
    )
    assert.equal(repeated.status, 200)
    assert.equal(repeated.data.id, winner.data.id)
    const edited = await req(
      "/api/collections/cases/records/" + winner.data.id,
      "PATCH",
      { notes: "Owner edit" },
      winnerToken
    )
    assert.equal(edited.status, 200, JSON.stringify(edited))
    const forbidden = await req(
      "/api/collections/cases/records/" + winner.data.id,
      "PATCH",
      { is_paid: true },
      winnerToken
    )
    assert.notEqual(forbidden.status, 200)
    const drafts = await req("/api/collections/public_lectures_public/records")
    assert.equal(drafts.status, 200)
    assert.equal(drafts.data.totalItems, 0)
    const baseDrafts = await req("/api/collections/public_lectures/records")
    assert.equal(baseDrafts.status, 200)
    assert.equal(baseDrafts.data.totalItems, 0)
    const cancel = await req(
      "/api/collections/cases/records/" + winner.data.id,
      "PATCH",
      { program_status: "cancelled" },
      admin
    )
    assert.equal(cancel.status, 200, JSON.stringify(cancel))
    assert.equal(
      (
        await req(
          "/api/collections/programs/records/auditprogram001",
          "GET",
          null,
          admin
        )
      ).data.current_registrations,
      0
    )
    const cancelAgain = await req(
      "/api/collections/cases/records/" + winner.data.id,
      "PATCH",
      { program_status: "cancelled" },
      admin
    )
    assert.equal(cancelAgain.status, 200)
    assert.equal(
      (
        await req(
          "/api/collections/programs/records/auditprogram001",
          "GET",
          null,
          admin
        )
      ).data.current_registrations,
      0
    )
  } finally {
    await new Promise((resolve) => {
      if (server.exitCode !== null) return resolve()
      server.once("exit", resolve)
      server.kill()
    })
  }
})
