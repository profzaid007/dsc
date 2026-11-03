import test from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import net from "node:net"
import {spawn, spawnSync} from "node:child_process"

test("assignment response hooks match the deployment mirror", () => {
  for (const file of ["assignment-response.pb.js", "lib/assignment-response.js"])
    assert.equal(fs.readFileSync(path.resolve("pb_hooks", file), "utf8"), fs.readFileSync(path.resolve("backend/pb/pb_hooks", file), "utf8"))
})

test("assignment responses redact private notes without changing storage and expose creator-only editing", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "dsc-assignment-response-"))
  const hooks = path.join(dir, "hooks"), migrations = path.join(dir, "migrations")
  fs.mkdirSync(path.join(hooks, "lib"), {recursive:true}); fs.mkdirSync(migrations)
  for (const file of ["assignment-response.pb.js", "lib/assignment-response.js", "lib/security-policy.js"])
    fs.copyFileSync(path.resolve("pb_hooks", file), path.join(hooks, file))
  fs.writeFileSync(path.join(migrations, "1000_fixture.js"), `migrate(app=>{
    const users=app.findCollectionByNameOrId('users');
    users.fields.add(new TextField({name:'role'}));users.fields.add(new BoolField({name:'is_active'}));app.save(users);
    function user(id,role){const r=new Record(users,{id,email:id+'@example.test',password:'FixturePassword123!',role,is_active:true});app.save(r);return r}
    const owner=user('parent000000001','parent'), expert=user('expert000000001','expert');user('expert000000002','expert');user('expert000000003','expert');user('admin0000000001','super_admin');
    function collection(name,fields){const c=new Collection({name,type:'base',listRule:'@request.auth.id != ""',viewRule:'@request.auth.id != ""',fields});app.save(c);return c}
    const cases=collection('cases',[{name:'user',type:'text'}]);app.save(new Record(cases,{id:'case00000000001',user:owner.id}));
    const allocations=collection('case_experts',[{name:'case_id',type:'text'},{name:'expert_id',type:'text'}]);
    for(const id of [expert.id,'expert000000002'])app.save(new Record(allocations,{case_id:'case00000000001',expert_id:id}));
    const audit=collection('security_audit_log',['actor','action','target_type','target_id'].map(name=>({name,type:'text'})));
    const tasks=collection('case_tools',[...['case','status'].map(name=>({name,type:'text'})),{name:'is_not_template',type:'bool'},{name:'config',type:'json'},{name:'media',type:'file',maxSelect:3}]);
    tasks.updateRule='@request.auth.id != ""';app.save(tasks);
    const links=collection('assignment_links',[{name:'task',type:'relation',collectionId:tasks.id,maxSelect:1}]);
    for(const [id,custom,status,visible] of [['meeting00000001',true,'assigned',false],['meeting00000002',true,'completed',false],['meeting00000003',false,'assigned',false],['meeting00000004',true,'assigned',true],['meeting00000005',true,'assigned',undefined],['meeting00000006',true,'assigned','true']]){
      app.save(new Record(tasks,{id,case:'case00000000001',status,is_not_template:custom,config:{date:'2026-11-03',time:'10:00',description:'Public description',notes:'Private staff note',notesVisibleToUser:visible}}));
      app.save(new Record(audit,{actor:expert.id,action:'assignment.create',target_type:'case_tools',target_id:id}));
    }
    app.save(new Record(links,{id:'link00000000001',task:'meeting00000001'}));
  })`)
  // This fixture deliberately grants record reads; tests exercise response policy,
  // not case access rules, and never use a running application's database.
  fs.writeFileSync(path.join(hooks, "fixture.pb.js"), `routerAdd('GET','/__fixture/stored',e=>e.json(200,JSON.parse(e.app.findRecordById('case_tools','meeting00000001').getString('config'))))`)
  const candidates = process.env.POCKETBASE_BIN ? [path.resolve(process.env.POCKETBASE_BIN)] : [
    path.resolve("../work/pocketbase-0.31.0/pocketbase.exe"),
    path.resolve("../work/pocketbase/pocketbase.exe"),
    path.resolve("../work/pocketbase-0.31.0/pocketbase"),
    path.resolve("../work/pocketbase/pocketbase"),
  ]
  const binary = candidates.find(candidate => fs.existsSync(candidate))
  assert.ok(binary, "Set POCKETBASE_BIN to a PocketBase executable to run this isolated integration test.")
  const args = ["--dir",path.join(dir,"data"),"--migrationsDir",migrations,"--hooksDir",hooks]
  const migrated = spawnSync(binary,["migrate","up",...args],{encoding:"utf8",windowsHide:true})
  assert.equal(migrated.status,0,migrated.stdout+migrated.stderr)
  const port = await new Promise(resolve=>{const s=net.createServer();s.listen(0,"127.0.0.1",()=>{const p=s.address().port;s.close(()=>resolve(p))})})
  const log = fs.openSync(path.join(dir,"server.log"),"w")
  const server=spawn(binary,["serve",...args,"--http",`127.0.0.1:${port}`],{stdio:["ignore",log,log],windowsHide:true})
  const base=`http://127.0.0.1:${port}`
  try {
    for(let i=0;i<80;i++){try {if((await fetch(base+"/api/health")).ok)break}catch{}await new Promise(r=>setTimeout(r,100))}
    async function login(id){const r=await fetch(base+"/api/collections/users/auth-with-password",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({identity:id+"@example.test",password:"FixturePassword123!"})});assert.equal(r.status,200,await r.clone().text());return (await r.json()).token}
    const parent=await login("parent000000001"), creator=await login("expert000000001"), allocated=await login("expert000000002"), foreign=await login("expert000000003"), admin=await login("admin0000000001")
    async function get(id,token){const r=await fetch(base+"/api/collections/case_tools/records/"+id,{headers:{Authorization:token}});assert.equal(r.status,200,await r.clone().text());return r.json()}
    const hidden=await get("meeting00000001",parent)
    assert.equal(hidden.config.notes,undefined);assert.equal(hidden.config.description,"Public description");assert.equal(hidden.can_edit_configuration,false)
    assert.equal((await get("meeting00000004",parent)).config.notes,"Private staff note")
    assert.equal((await get("meeting00000005",parent)).config.notes,undefined)
    assert.equal((await get("meeting00000006",parent)).config.notes,undefined)
    const staff=await get("meeting00000001",creator);assert.equal(staff.config.notes,"Private staff note");assert.equal(staff.can_edit_configuration,true)
    assert.equal((await get("meeting00000001",allocated)).can_edit_configuration,false)
    assert.equal((await get("meeting00000001",foreign)).can_edit_configuration,false)
    assert.equal((await get("meeting00000002",creator)).can_edit_configuration,false)
    assert.equal((await get("meeting00000003",creator)).can_edit_configuration,false)
    assert.equal((await get("meeting00000001",admin)).can_edit_configuration,true)
    const list=await fetch(base+"/api/collections/case_tools/records",{headers:{Authorization:parent}}).then(r=>r.json())
    assert.equal(list.items.find(x=>x.id==="meeting00000001").config.notes,undefined)
    const fields=await fetch(base+"/api/collections/case_tools/records/meeting00000001?fields=config.notes,config.description",{headers:{Authorization:parent}}).then(r=>r.json());assert.equal(fields.config?.notes,undefined)
    const expanded=await fetch(base+"/api/collections/assignment_links/records/link00000000001?expand=task",{headers:{Authorization:parent}}).then(r=>r.json());assert.equal(expanded.expand.task.config.notes,undefined)
    const upload=new FormData();upload.append('media',new Blob(['Fixture file'],{type:'text/plain'}),'fixture.txt');upload.append('can_edit_configuration','true')
    const uploaded=await fetch(base+"/api/collections/case_tools/records/meeting00000001",{method:'PATCH',headers:{Authorization:parent},body:upload});assert.equal(uploaded.status,200,await uploaded.clone().text());const uploadedBody=await uploaded.json();assert.equal(uploadedBody.config.notes,undefined);assert.equal(uploadedBody.can_edit_configuration,false)
    const storedResponse=await fetch(base+"/__fixture/stored");assert.equal(storedResponse.status,200);const stored=await storedResponse.json();assert.equal(stored.notes,"Private staff note")
  } finally {server.kill();await new Promise(resolve=>server.once("exit",resolve));fs.closeSync(log)}
})
