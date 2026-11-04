import test from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import net from "node:net"
import { spawn, spawnSync } from "node:child_process"

test("PocketBase preserves uploaded portraits, blocks accidental clearing and audits intentional changes", async () => {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), "dsc-photo-protection-"))
  const migrations = path.join(folder, "migrations")
  const hooks = path.join(folder, "hooks")
  fs.mkdirSync(migrations)
  fs.mkdirSync(path.join(hooks, "lib"), { recursive: true })
  fs.writeFileSync(
    path.join(migrations, "1000_fixture.js"),
    `migrate(app => {
    const users = app.findCollectionByNameOrId('users');
    if (!users.fields.getByName('name')) users.fields.add(new TextField({name:'name'}));
    app.save(users);
    const user = new Record(users);user.set('email','photo@example.test');user.set('password','TestPassword123!');app.save(user);
    app.save(new Collection({name:'expert_profiles',type:'base',listRule:'',viewRule:'',
      createRule:'@request.auth.id = user',updateRule:'@request.auth.id = user',fields:[
        {name:'user',type:'relation',collectionId:users.id,maxSelect:1},
        {name:'public_name_ar',type:'text'},{name:'public_name_en',type:'text'},
        {name:'profile_photo',type:'file',maxSelect:1,maxSize:10240,mimeTypes:['image/png']}
      ]}));
    app.save(new Collection({name:'security_audit_log',type:'base',listRule:'',fields:[
      ...['actor','action','target_type','target_id'].map(name=>({name,type:'text'})),
      {name:'before',type:'json'},{name:'after',type:'json'}
    ]}));
  });`
  )
  for (const file of ["expert-profile-sync.pb.js", "lib/security-policy.js"])
    fs.copyFileSync(path.resolve("pb_hooks", file), path.join(hooks, file))
  const binary = path.resolve("../work/pocketbase-0.31.0/pocketbase.exe")
  const args = [
    "--dir",
    path.join(folder, "data"),
    "--migrationsDir",
    migrations,
    "--hooksDir",
    hooks,
  ]
  const migration = spawnSync(binary, ["migrate", "up", ...args], {
    encoding: "utf8",
    windowsHide: true,
  })
  assert.equal(
    migration.status,
    0,
    String(migration.error || migration.stdout + migration.stderr)
  )
  const port = await new Promise((resolve) => {
    const server = net.createServer()
    server.listen(0, "127.0.0.1", () => {
      const port = server.address().port
      server.close(() => resolve(port))
    })
  })
  const server = spawn(
    binary,
    ["serve", ...args, "--http", `127.0.0.1:${port}`],
    { windowsHide: true }
  )
  let logs = ""
  server.stdout.on("data", (chunk) => (logs += chunk))
  server.stderr.on("data", (chunk) => (logs += chunk))
  try {
    const base = `http://127.0.0.1:${port}`
    let healthy = false
    for (let i = 0; i < 100; i++) {
      if (server.exitCode !== null) throw Error(logs)
      try {
        if ((await fetch(base + "/api/health")).ok) {
          healthy = true
          break
        }
      } catch {}
      await new Promise((resolve) => setTimeout(resolve, 30))
    }
    assert.ok(healthy, logs)
    const authResponse = await fetch(
      base + "/api/collections/users/auth-with-password",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identity: "photo@example.test",
          password: "TestPassword123!",
        }),
      }
    )
    const auth = await authResponse.json()
    assert.equal(authResponse.status, 200, JSON.stringify(auth))
    const photo = () =>
      new File(
        [
          Buffer.from(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a0V8AAAAASUVORK5CYII=",
            "base64"
          ),
        ],
        "portrait.png",
        { type: "image/png" }
      )
    const body = new FormData()
    body.set("user", auth.record.id)
    body.set("public_name_ar", "خبير")
    body.set("public_name_en", "Expert")
    body.set("profile_photo", photo())
    const createdResponse = await fetch(
      base + "/api/collections/expert_profiles/records",
      { method: "POST", headers: { Authorization: auth.token }, body }
    )
    const created = await createdResponse.json()
    assert.equal(createdResponse.status, 200, JSON.stringify(created))
    assert.ok(created.profile_photo)
    const url = base + "/api/collections/expert_profiles/records/" + created.id
    async function update(body, json = false) {
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          Authorization: auth.token,
          ...(json ? { "Content-Type": "application/json" } : {}),
        },
        body: json ? JSON.stringify(body) : body,
      })
      return { status: response.status, data: await response.json() }
    }
    const ordinary = await update({ public_name_en: "Updated" }, true)
    assert.equal(ordinary.status, 200, JSON.stringify(ordinary))
    assert.equal(ordinary.data.profile_photo, created.profile_photo)
    const accidental = await update({ profile_photo: "" }, true)
    assert.equal(accidental.status, 400, JSON.stringify(accidental))
    assert.equal(
      (await (await fetch(url)).json()).profile_photo,
      created.profile_photo
    )
    const accidentalForm = new FormData()
    accidentalForm.set("profile_photo", "")
    assert.equal((await update(accidentalForm)).status, 400)
    assert.equal(
      (await update({ "profile_photo-": created.profile_photo }, true)).status,
      400
    )
    const replacement = new FormData()
    replacement.set("profile_photo", photo())
    const replaced = await update(replacement)
    assert.equal(replaced.status, 200, JSON.stringify(replaced))
    assert.ok(replaced.data.profile_photo)
    assert.notEqual(replaced.data.profile_photo, created.profile_photo)
    const removal = new FormData()
    removal.set("profile_photo", "")
    removal.set("confirm_profile_photo_removal", "true")
    const removed = await update(removal)
    assert.equal(removed.status, 200, JSON.stringify(removed))
    assert.equal(removed.data.profile_photo, "")
    const audit = await (
      await fetch(base + "/api/collections/security_audit_log/records")
    ).json()
    assert.equal(audit.totalItems, 2)
    assert.deepEqual(audit.items.map((entry) => entry.action).sort(), [
      "expert.photo.remove",
      "expert.photo.replace",
    ])
    assert.ok(
      audit.items.every(
        (entry) =>
          entry.actor === auth.record.id && entry.target_id === created.id
      )
    )
  } finally {
    await new Promise((resolve) => {
      if (server.exitCode !== null) return resolve()
      server.once("exit", resolve)
      server.kill()
    })
  }
})
