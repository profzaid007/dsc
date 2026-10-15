import test from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import { spawn, spawnSync } from "node:child_process"
import net from "node:net"

test("PocketBase unifies seven roots without losing roles, posts, custom categories or old event labels", async () => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "dsc-taxonomy-"))
  const migrations = path.join(fixture, "migrations")
  fs.mkdirSync(migrations)
  fs.writeFileSync(path.join(migrations, "1000_fixture.js"), `migrate(app=>{
    const roots=new Collection({name:'specialist_role_categories',type:'base',deleteRule:'',fields:[
      {name:'key',type:'text'},{name:'name_en',type:'text'},{name:'name_ar',type:'text'},{name:'order',type:'number'}]});app.save(roots);
    app.save(new Record(roots,{id:'psychology00001',key:'psychology',name_en:'Psychology'}));
    app.save(new Record(roots,{id:'legacyother0001',key:'custom-other',name_en:'Other'}));
    const roles=new Collection({name:'roles_management',type:'base',createRule:'',fields:[
      {name:'category',type:'relation',collectionId:roots.id,maxSelect:1},{name:'role_group',type:'text'},{name:'tool_types',type:'json'}]});app.save(roles);
    app.save(new Record(roles,{id:'existingrole001',category:'psychology00001',role_group:'mental-health',tool_types:['preserve-me']}));
    app.save(new Record(roles,{id:'otherrole000001',category:'legacyother0001',role_group:'other',tool_types:['keep-other-tool']}));
    const children=new Collection({name:'blog_categories',type:'base',deleteRule:'',fields:[{name:'key',type:'text'},{name:'label_en',type:'text'},{name:'label_ar',type:'text'}]});app.save(children);
    app.save(new Record(children,{id:'autismchild0001',key:'autism',label_en:'Autism',label_ar:'التوحد'}));
    app.save(new Record(children,{id:'customchild0001',key:'custom-subject',label_en:'Custom subject'}));
    const posts=new Collection({name:'blog_pages',type:'base',createRule:'',fields:[{name:'category',type:'text'},{name:'content_en',type:'text'}]});app.save(posts);
    app.save(new Record(posts,{id:'existingpost001',category:'autism',content_en:'Keep this content'}));
    const programs=new Collection({name:'programs',type:'base',fields:[{name:'category',type:'json'}]});app.save(programs);
    app.save(new Record(programs,{id:'matchedprog0001',category:{en:'Autism',ar:'التوحد'}}));
    app.save(new Record(programs,{id:'unknownprog0001',category:{en:'Unrelated legacy subject',ar:'قديم'}}));
    const lectures=new Collection({name:'public_lectures',type:'base',fields:[{name:'title',type:'json'},{name:'is_public',type:'bool'}]});app.save(lectures);
    app.save(new Record(lectures,{id:'existinglect001',title:{en:'Existing lecture'},is_public:true}));
    app.save(new Collection({name:'public_lectures_public',type:'view',viewQuery:'SELECT id,title,is_public FROM public_lectures WHERE is_public = true'}));
  });`)
  fs.copyFileSync(path.resolve("pb_migrations/1793200000_unified_classification.js"), path.join(migrations,"1793200000_unified_classification.js"))
  fs.writeFileSync(path.join(migrations,"1793200001_verify.js"), `migrate(app=>{
    const roots=app.findRecordsByFilter('specialist_role_categories','is_active = true','',0,0);
    if(roots.length!==7)throw new Error('Expected seven active roots');
    if(app.findRecordById('specialist_role_categories','psychology00001').getString('key')!=='mental-health')throw new Error('Root ID lost');
    const role=app.findRecordById('roles_management','existingrole001');
    if(role.getString('category')!=='psychology00001' || !role.getString('tool_types').includes('preserve-me'))throw new Error('Role changed');
    const post=app.findRecordById('blog_pages','existingpost001');
    if(post.getString('main_category')!=='special-needs'||post.getString('content_en')!=='Keep this content'||post.getString('category')!=='autism')throw new Error('Post lost');
    if(app.findRecordById('programs','matchedprog0001').getString('subcategory')!=='autism')throw new Error('Exact training match missed');
    const old=app.findRecordById('programs','unknownprog0001');
    if(old.getString('main_category') || !old.getString('category').includes('Unrelated legacy subject'))throw new Error('Historical category overwritten');
    app.findRecordById('blog_categories','customchild0001');
    const view=app.findCollectionByNameOrId('public_lectures_public');
    if(!view.viewQuery.includes('main_category'))throw new Error('Public projection missing');
    const media=roots.find(c=>c.getString('key')==='dsc-news');
    if(!media.getBool('media_only'))throw new Error('Media flag missing');
  });`)
  const binary=path.resolve("../work/pocketbase-0.31.0/pocketbase.exe")
  const args=["migrate","up","--dir",path.join(fixture,"data"),"--migrationsDir",migrations]
  const result=spawnSync(binary,args,{encoding:"utf8",windowsHide:true})
  assert.equal(result.status,0,result.stdout+result.stderr)
  assert.match(result.stdout+result.stderr,/Applied 1793200001_verify/,result.stdout+result.stderr)
  // Repeat the migration body under a new filename to verify additive idempotence.
  fs.copyFileSync(path.join(migrations,"1793200000_unified_classification.js"),path.join(migrations,"1793200002_repeat.js"))
  const repeated=spawnSync(binary,args,{encoding:"utf8",windowsHide:true})
  assert.equal(repeated.status,0,repeated.stdout+repeated.stderr)
  assert.match(repeated.stdout+repeated.stderr,/Applied 1793200002_repeat/,repeated.stdout+repeated.stderr)
  fs.copyFileSync(path.resolve("pb_migrations/1793300000_research_and_other_categories.js"),path.join(migrations,"1793300000_research_and_other_categories.js"))
  fs.writeFileSync(path.join(migrations,"1793300001_verify_additions.js"), `migrate(app=>{
    const roots=app.findRecordsByFilter('specialist_role_categories','is_active = true','',0,0);
    if(roots.length!==8 || roots.filter(c=>!c.getBool('media_only')).length!==7)throw new Error('Expected seven professional categories plus media');
    const other=app.findRecordById('specialist_role_categories','legacyother0001');
    if(other.getString('key')!=='other'||!other.getBool('is_active'))throw new Error('Legacy Other ID must be retained');
    const role=app.findRecordById('roles_management','otherrole000001');
    if(role.getString('category')!==other.id||role.getString('role_group')!=='other'||!role.getString('tool_types').includes('keep-other-tool'))throw new Error('Other role links lost');
    if(roots.filter(c=>c.getString('key')==='research').length!==1)throw new Error('Duplicate Research');
    for(const name of ['blog_categories','blog_pages','programs','public_lectures']) {
      if(!Array.from(app.findCollectionByNameOrId(name).fields.getByName('main_category').values).includes('other'))throw new Error('Other missing in content categories');
    }
  });`)
  const additions=spawnSync(binary,args,{encoding:"utf8",windowsHide:true})
  assert.equal(additions.status,0,additions.stdout+additions.stderr)
  assert.match(additions.stdout+additions.stderr,/Applied 1793300001_verify_additions/,additions.stdout+additions.stderr)
  const hooks=path.join(fixture,"hooks")
  fs.mkdirSync(path.join(hooks,"lib"),{recursive:true})
  for(const file of ["classification.pb.js","lib/classification-validation.js","lib/classification-catalog.js"]) fs.copyFileSync(path.resolve("backend/pb/pb_hooks",file),path.join(hooks,file))
  const port=await new Promise(resolve=>{const listener=net.createServer();listener.listen(0,"127.0.0.1",()=>{const port=listener.address().port;listener.close(()=>resolve(port))})})
  const server=spawn(binary,["serve","--dir",path.join(fixture,"data"),"--migrationsDir",migrations,"--hooksDir",hooks,"--http",`127.0.0.1:${port}`],{windowsHide:true})
  let logs=""
  server.stdout.on("data",chunk=>{logs+=chunk})
  server.stderr.on("data",chunk=>{logs+=chunk})
  try {
    const base=`http://127.0.0.1:${port}`
    let healthy=false
    for(let i=0;i<100;i++) {
      if(server.exitCode!==null)throw new Error(logs)
      try { if((await fetch(base+"/api/health")).ok){healthy=true;break} }catch{}
      await new Promise(resolve=>setTimeout(resolve,30))
    }
    assert.ok(healthy,logs)
    async function create(body) {
      const response=await fetch(base+"/api/collections/blog_pages/records",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)})
      return {status:response.status,body:await response.json()}
    }
    const mismatch=await create({main_category:"medical",category:"autism",content_en:"Mismatch"})
    assert.equal(mismatch.status,400,JSON.stringify(mismatch.body))
    const valid=await create({main_category:"special-needs",category:"autism",content_en:"Valid"})
    assert.equal(valid.status,200,JSON.stringify(valid.body))
    assert.equal(valid.body.main_category,"special-needs")
    const mediaRole=await fetch(base+"/api/collections/roles_management/records",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({role_group:"dsc-news"})})
    assert.equal(mediaRole.status,400,await mediaRole.text())
    const professionalRole=await fetch(base+"/api/collections/roles_management/records",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({role_group:"research"})})
    const createdRole=await professionalRole.json()
    assert.equal(professionalRole.status,200,JSON.stringify(createdRole))
    assert.ok(createdRole.category,"Role category relation must follow the shared group")
    const otherRole=await fetch(base+"/api/collections/roles_management/records",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({role_group:"other"})})
    const otherBody=await otherRole.json()
    assert.equal(otherRole.status,200,JSON.stringify(otherBody))
    assert.equal(otherBody.category,"legacyother0001")
    const deleteRoot=await fetch(base+"/api/collections/specialist_role_categories/records/psychology00001",{method:"DELETE"})
    assert.equal(deleteRoot.status,400,await deleteRoot.text())
    const deleteUsedChild=await fetch(base+"/api/collections/blog_categories/records/autismchild0001",{method:"DELETE"})
    assert.equal(deleteUsedChild.status,400,await deleteUsedChild.text())
  } finally {
    await new Promise(resolve=>{if(server.exitCode!==null)return resolve();server.once("exit",resolve);server.kill()})
  }
})
