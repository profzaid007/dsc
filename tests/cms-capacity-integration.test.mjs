import { test, before, after } from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import net from "node:net"
import { spawn, spawnSync } from "node:child_process"
import { fileURLToPath } from "node:url"

// Disposable localhost database only. Never reads .env or live credentials.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const binary =
  process.env.CMS_TEST_POCKETBASE ||
  path.resolve(root, "../work/pocketbase/pocketbase.exe")
const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "dsc-cms-capacity-"))
const migrations = path.join(fixture, "migrations")
const dataDir = path.join(fixture, "data")
const hooks = path.join(fixture, "hooks")
const names = ["home_pages", "info_pages", "blog_pages"]
const recordId = "cmsfixture00001"
const source =
  "<!--dsc:custom-layout:v1-->\n" +
  fs.readFileSync(
    path.join(root, "tests/fixtures/custom-cms-layout.html"),
    "utf8"
  )
let server,
  base,
  port,
  logs = ""

async function stop() {
  if (!server || server.exitCode !== null) return
  await new Promise((resolve) => {
    server.once("exit", resolve)
    server.kill()
  })
}
async function start() {
  logs = ""
  server = spawn(
    binary,
    [
      "serve",
      "--dir",
      dataDir,
      "--migrationsDir",
      migrations,
      "--hooksDir",
      hooks,
      "--http",
      `127.0.0.1:${port}`,
    ],
    { windowsHide: true }
  )
  server.stdout.on("data", (chunk) => {
    logs += chunk
  })
  server.stderr.on("data", (chunk) => {
    logs += chunk
  })
  for (let attempt = 0; attempt < 100; attempt++) {
    if (server.exitCode !== null) throw new Error(logs)
    try {
      if ((await fetch(base + "/api/health")).ok) return
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  throw new Error("PocketBase did not start: " + logs)
}
async function request(name, body) {
  const response = await fetch(
    `${base}/api/collections/${name}/records/${recordId}`,
    {
      method: body ? "PATCH" : "GET",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    }
  )
  return { status: response.status, body: await response.json() }
}
function migrate() {
  const result = spawnSync(
    binary,
    [
      "migrate",
      "up",
      "--dir",
      dataDir,
      "--migrationsDir",
      migrations,
      "--hooksDir",
      hooks,
    ],
    { encoding: "utf8", windowsHide: true }
  )
  assert.equal(result.status, 0, result.stdout + result.stderr)
}

before(async () => {
  assert.ok(
    fs.existsSync(binary),
    "Set CMS_TEST_POCKETBASE to a PocketBase executable"
  )
  fs.mkdirSync(migrations)
  fs.mkdirSync(hooks)
  fs.writeFileSync(
    path.join(migrations, "1000_fixture.js"),
    `migrate(app => {
    for (const name of ${JSON.stringify(names)}) {
      const collection = new Collection({ name, type: 'base', listRule: '', viewRule: '', updateRule: '', fields: [
        {name:'content_en',type:'text',max:name === 'info_pages' ? 2000000 : 0},
        {name:'content_ar',type:'text',max:0}
      ]});
      app.save(collection);
      const record = new Record(collection, {id:${JSON.stringify(recordId)}, content_en:'Original English',content_ar:'المحتوى الأصلي'});
      app.save(record);
    }
  });`
  )
  migrate()
  port = await new Promise((resolve) => {
    const listener = net.createServer()
    listener.listen(0, "127.0.0.1", () => {
      const value = listener.address().port
      listener.close(() => resolve(value))
    })
  })
  base = `http://127.0.0.1:${port}`
  await start()
})

test("legacy max=0 rejects the supplied complete layout, then migration permits saving and reopening", async () => {
  assert.ok(Array.from(source).length > 5000)
  const rejected = await request("home_pages", { content_ar: source })
  assert.equal(rejected.status, 400)
  assert.ok(rejected.body.data.content_ar)
  console.log(
    "Legacy rejection:",
    rejected.body.data.content_ar.code,
    rejected.body.data.content_ar.message
  )
  const original = await request("home_pages")
  assert.equal(original.body.content_ar, "المحتوى الأصلي")
  await stop()
  fs.copyFileSync(
    path.join(root, "pb_migrations/1793000000_cms_content_capacity.js"),
    path.join(migrations, "1793000000_cms_content_capacity.js")
  )
  migrate()
  // A verification migration exercises actual JSVM field metadata and rules.
  fs.writeFileSync(
    path.join(migrations, "1793000001_verify.js"),
    `migrate(app => {
    for (const name of ${JSON.stringify(names)}) {
      const c=app.findCollectionByNameOrId(name);
      if(c.fields.getByName('content_ar').max!==1000000)throw new Error('Arabic capacity');
      if(c.fields.getByName('content_en').max!==(name==='info_pages'?2000000:1000000))throw new Error('English capacity');
      const schema=JSON.parse(JSON.stringify(c));
      if(schema.viewRule!=='' || schema.updateRule!=='')throw new Error('Rules changed');
      if(app.findRecordById(name,${JSON.stringify(recordId)}).getString('content_ar')!=='المحتوى الأصلي')throw new Error('Record changed');
    }
  });`
  )
  migrate()
  await start()
  for (const name of names) {
    const saved = await request(name, { content_ar: source })
    assert.equal(saved.status, 200, JSON.stringify(saved.body.data))
    const reopened = await request(name)
    assert.equal(reopened.body.content_ar.trim(), source.trim())
    assert.equal(reopened.body.content_en, "Original English")
  }
  await stop()
  await start()
  const reopened = await request("home_pages")
  assert.equal(reopened.body.content_ar.trim(), source.trim())
})

test("both deployment migration copies and fresh-install schema agree", () => {
  assert.equal(
    fs.readFileSync(
      path.join(root, "pb_migrations/1793000000_cms_content_capacity.js"),
      "utf8"
    ),
    fs.readFileSync(
      path.join(
        root,
        "backend/pb/pb_migrations/1793000000_cms_content_capacity.js"
      ),
      "utf8"
    )
  )
  const schema = JSON.parse(
    fs.readFileSync(path.join(root, "backend/pb/pb_schema.json"), "utf8")
  )
  for (const collection of schema.filter((item) => names.includes(item.name))) {
    for (const field of collection.fields.filter((item) =>
      ["content_en", "content_ar"].includes(item.name)
    ))
      assert.ok(field.max >= 1000000)
  }
})

after(async () => {
  await stop()
  const resolved = path.resolve(fixture)
  assert.equal(path.dirname(resolved), path.resolve(os.tmpdir()))
  assert.ok(path.basename(resolved).startsWith("dsc-cms-capacity-"))
  fs.rmSync(resolved, { recursive: true, force: true })
})
