import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import {spawnSync} from 'node:child_process'

test('current-role migration deletes unmatched allocations, preserves valid links and removes the legacy field', () => {
 const folder=fs.mkdtempSync(path.join(os.tmpdir(),'dsc-current-allocation-'))
 const migrations=path.join(folder,'migrations');fs.mkdirSync(migrations)
 fs.writeFileSync(path.join(migrations,'1000_fixture.js'),`migrate(app=>{
 const roles=new Collection({name:'roles_management',type:'base',fields:[{type:'text',name:'role_name_en'}]});app.save(roles);
 const role=new Record(roles);role.set('role_name_en','Current Specialist');app.save(role);
 const c=new Collection({name:'case_experts',type:'base',fields:[{type:'select',name:'role',values:['teacher'],maxSelect:1},{type:'relation',name:'role_id',collectionId:roles.id,maxSelect:1}]});app.save(c);
 const valid=new Record(c);valid.id='validfixture001';valid.set('role','teacher');valid.set('role_id',role.id);app.save(valid);
 const missing=new Record(c);missing.id='emptyfixture001';missing.set('role','teacher');app.save(missing);
 const stale=new Record(c);stale.id='stalefixture001';stale.set('role_id','missingrole0001');app.saveNoValidate(stale);
 });`)
 const filename='1795300000_current_allocation_roles.js'
 fs.copyFileSync(path.resolve('pb_migrations',filename),path.join(migrations,filename))
 assert.equal(fs.readFileSync(path.resolve('pb_migrations',filename),'utf8'),fs.readFileSync(path.resolve('backend/pb/pb_migrations',filename),'utf8'))
 fs.writeFileSync(path.join(migrations,'1795300001_verify.js'),`migrate(app=>{
 const c=app.findCollectionByNameOrId('case_experts');
 if(c.fields.getByName('role'))throw Error('Legacy field remains');
 if(!c.fields.getByName('role_id').required)throw Error('Role relation is not required');
 const records=app.findAllRecords('case_experts');if(records.length!==1||records[0].id!=='validfixture001')throw Error('Wrong allocations retained');
 const r=records[0];const role=app.findRecordById('roles_management',r.getString('role_id'));if(role.getString('role_name_en')!=='Current Specialist')throw Error('Current link lost');
 const added=new Record(c);added.set('role_id',role.id);app.save(added);
 let denied=false;try{app.save(new Record(c))}catch(e){denied=true}if(!denied)throw Error('Missing role accepted');
 });`)
 const result=spawnSync(path.resolve('../work/pocketbase-0.31.0/pocketbase.exe'),['migrate','up','--dir',path.join(folder,'data'),'--migrationsDir',migrations],{encoding:'utf8',windowsHide:true})
 assert.equal(result.status,0,result.stdout+result.stderr)
 assert.match(result.stdout+result.stderr,/Applied 1795300001_verify/)
 assert.match(result.stdout+result.stderr,/removed 2 unmatched allocations/)
})
