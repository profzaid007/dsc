import test from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import { spawnSync } from "node:child_process"

test("PocketBase cleanup preserves classified rows and redirects required and multi-value relations", () => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "dsc-lookups-"))
  const migrations = path.join(fixture, "migrations")
  fs.mkdirSync(migrations)
  fs.writeFileSync(path.join(migrations, "1000_fixture.js"), `migrate(app => {
    const lookups = new Collection({name:'lookups',type:'base',fields:[
      {name:'type',type:'text'},{name:'key',type:'text'},{name:'label_en',type:'text'},{name:'label_ar',type:'text'}]});
    app.save(lookups);
    for(const [id,type,key] of [['oldsurvey000001','','survey'],['newsurvey000001','tool_types','survey'],['casetest0000001','case_types','case_test']]) {
      app.save(new Record(lookups,{id,type,key}));
    }
    const tools=new Collection({name:'case_tools',type:'base',fields:[{name:'type',type:'relation',collectionId:lookups.id,maxSelect:1,required:true}]});
    const roles=new Collection({name:'roles_management',type:'base',fields:[{name:'tool_types',type:'relation',collectionId:lookups.id,maxSelect:10}]});
    app.save(tools);app.save(roles);
    app.save(new Record(tools,{id:'toolrecord00001',type:'oldsurvey000001'}));
    app.save(new Record(roles,{id:'rolerecord00001',tool_types:['oldsurvey000001','newsurvey000001']}));
  });`)
  for (const name of ["1793100000_care_foundation_lookup.js", "1793100100_remove_untyped_lookups.js"]) {
    fs.copyFileSync(path.resolve("pb_migrations", name), path.join(migrations, name))
  }
  fs.writeFileSync(path.join(migrations, "1793100101_verify.js"), `migrate(app=>{
    if(app.findRecordsByFilter('lookups','type = ""','',0,0).length) throw new Error('Legacy rows remain');
    app.findRecordById('lookups','casetest0000001');
    if(app.findRecordById('case_tools','toolrecord00001').getString('type')!=='newsurvey000001')throw new Error('Required relation lost');
    const ids=app.findRecordById('roles_management','rolerecord00001').getStringSlice('tool_types');
    if(ids.length!==1 || ids[0]!=='newsurvey000001')throw new Error('Multi relation lost');
    if(app.findRecordsByFilter('lookups','type = "user_types" && key = "care_foundation"','',0,0).length!==1)throw new Error('Missing care foundation');
  });`)
  fs.copyFileSync(path.resolve("pb_migrations/1793100200_remove_unused_case_type.js"), path.join(migrations,"1793100200_remove_unused_case_type.js"))
  fs.writeFileSync(path.join(migrations,"1793100201_verify.js"), `migrate(app=>{
    if(app.findRecordsByFilter('lookups','type = "case_types"','',0,0).length)throw new Error('Case type remains');
    app.findRecordById('lookups','newsurvey000001');
    app.findRecordById('case_tools','toolrecord00001');
  });`)
  const result = spawnSync(path.resolve("../work/pocketbase-0.31.0/pocketbase.exe"), ["migrate", "up", "--dir", path.join(fixture,"data"), "--migrationsDir", migrations], { encoding:"utf8", windowsHide:true })
  assert.equal(result.status,0,result.stdout+result.stderr)
})
