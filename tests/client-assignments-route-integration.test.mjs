import test from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import net from "node:net"
import { spawn, spawnSync } from "node:child_process"

test("deployed assignment route authenticates and isolates each client role without exporting private data", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "dsc-client-assignment-route-"))
  const hooks = path.join(dir, "hooks"), migrations = path.join(dir, "migrations")
  fs.mkdirSync(path.join(hooks, "lib"), { recursive: true }); fs.mkdirSync(migrations)
  const files = ["client-assignments.pb.js", "lib/client-assignments.js", "lib/case-owner-display.js", "lib/security-policy.js"]
  for (const file of files) {
    assert.equal(fs.readFileSync(path.resolve("pb_hooks", file), "utf8"), fs.readFileSync(path.resolve("backend/pb/pb_hooks", file), "utf8"), `${file} deployment mirror`)
    fs.copyFileSync(path.resolve("pb_hooks", file), path.join(hooks, file))
  }
  fs.writeFileSync(path.join(migrations, "1000_fixture.js"), `migrate(app=>{
    const admins=app.findCollectionByNameOrId('_superusers');app.save(new Record(admins,{email:'fixture-admin@example.test',password:'FixturePassword123!'}));
    const users=app.findCollectionByNameOrId('users');users.fields.add(new TextField({name:'role'}));users.fields.add(new BoolField({name:'is_active'}));app.save(users);
    function user(role){const r=new Record(users,{email:role+'@example.test',password:'FixturePassword123!',role,is_active:true});app.save(r);return r}
    const roles=['parent','individual','organization','care_foundation','expert'];const accounts=roles.map(user);
    function collection(name,fields){const c=new Collection({name,type:'base',fields:[...fields,{name:'created',type:'autodate',onCreate:true},{name:'updated',type:'autodate',onCreate:true,onUpdate:true}]});app.save(c);return c}
    function relation(name,c){return {name,type:'relation',collectionId:c.id,maxSelect:1}}
    const cases=collection('cases',[{name:'name',type:'text'},relation('user',users)]);
    const tools=collection('case_tools',[relation('case',cases),...['name_en','name_ar','status'].map(name=>({name,type:'text'})),{name:'is_visible_to_user',type:'bool'},{name:'config',type:'json'}]);
    const assessments=collection('assessments',[{name:'name',type:'text'}]);const scale=new Record(assessments,{name:'Shared scale'});app.save(scale);
    const sessions=collection('assessment_sessions',[relation('case',cases),relation('recipient',users),relation('assessment',assessments),{name:'status',type:'text'},{name:'submitted_at',type:'text'},{name:'snapshot',type:'json'}]);
    const organizations=collection('organization_profiles',[relation('user',users),{name:'organization_name',type:'text'}]);
    const owned=accounts.map((u,i)=>{const c=new Record(cases,{name:roles[i]+' owned case',user:u.id});app.save(c);return c});
    for(let i=0;i<4;i++){
      const c=owned[i],u=accounts[i];
      app.save(new Record(tools,{case:c.id,name_en:roles[i]+' visible task',name_ar:'تكليف مشترك',status:'assigned',is_visible_to_user:true,config:{notes:'PRIVATE STAFF NOTE'}}));
      app.save(new Record(tools,{case:c.id,name_en:'HIDDEN TASK',status:'assigned',is_visible_to_user:false}));
      app.save(new Record(sessions,{case:c.id,recipient:u.id,assessment:scale.id,status:'assigned',snapshot:{private:'PRIVATE ASSESSMENT DATA'}}));
      app.save(new Record(sessions,{case:owned[(i+1)%4].id,recipient:u.id,assessment:scale.id,status:'assigned'}));
      if(i>1)app.save(new Record(organizations,{user:u.id,organization_name:roles[i]+' organization'}));
    }
  })`)
  const binary = process.env.POCKETBASE_BIN || ["../work/pocketbase-0.31.0/pocketbase.exe", "../work/pocketbase/pocketbase.exe", "../work/pocketbase/pocketbase"].map(file => path.resolve(file)).find(file => fs.existsSync(file))
  assert.ok(binary, "Set POCKETBASE_BIN to an installed PocketBase executable")
  const args = ["--dir", path.join(dir, "data"), "--migrationsDir", migrations, "--hooksDir", hooks]
  const migrated = spawnSync(binary, ["migrate", "up", ...args], { encoding: "utf8", windowsHide: true })
  assert.equal(migrated.status, 0, migrated.stdout + migrated.stderr)
  const port = await new Promise(resolve => { const server = net.createServer(); server.listen(0, "127.0.0.1", () => { const value = server.address().port; server.close(() => resolve(value)) }) })
  const log = fs.openSync(path.join(dir, "server.log"), "w")
  const server = spawn(binary, ["serve", ...args, "--http", `127.0.0.1:${port}`], { stdio: ["ignore", log, log], windowsHide: true })
  const base = `http://127.0.0.1:${port}`
  try {
    for (let i = 0; i < 80; i++) { try { if ((await fetch(base + "/api/health")).ok) break } catch {} await new Promise(resolve => setTimeout(resolve, 100)) }
    const url = base + "/api/dsc/my-assignments"
    assert.equal((await fetch(url)).status, 401, "installed route requires authentication rather than returning missing-route 404")
    for (const role of ["parent", "individual", "organization", "care_foundation", "expert"]) {
      const login = await fetch(base + "/api/collections/users/auth-with-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ identity: role + "@example.test", password: "FixturePassword123!" }) })
      assert.equal(login.status, 200)
      const auth = await login.json()
      const response = await fetch(url, { headers: { Authorization: auth.token } })
      if (role === "expert") { assert.equal(response.status, 403); continue }
      assert.equal(response.status, 200, await response.clone().text())
      const body = await response.json()
      assert.equal(body.cases.length, 1)
      assert.equal(body.cases[0].name, role + " owned case")
      assert.equal(body.assignments.length, 2)
      assert.ok(body.assignments.every(item => item.case === body.cases[0].id))
      assert.deepEqual(body.assignments.map(item => item.kind).sort(), ["assessment", "task"])
      const text = JSON.stringify(body)
      assert.ok(!text.includes("HIDDEN TASK") && !text.includes("PRIVATE"))
      if (role === "organization" || role === "care_foundation") assert.equal(body.cases[0].owner_display.name, role + " organization")
    }
  } finally {
    const stopped = new Promise(resolve => server.once("exit", resolve)); server.kill(); await stopped; fs.closeSync(log)
  }
})
