import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import {spawnSync} from 'node:child_process'

test('expert list migration preserves list values, plain text and unrelated profile data',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'dsc-profile-lists-')), migrations=path.join(root,'migrations');fs.mkdirSync(migrations)
 fs.writeFileSync(path.join(migrations,'1000_fixture.js'),`migrate(app=>{
 const c=new Collection({name:'expert_profiles',type:'base',fields:[{type:'text',name:'age_group'},{type:'text',name:'specialization_type'},{type:'text',name:'profile_photo'},{type:'text',name:'public_name_en'}]});app.save(c);
 const r=new Record(c);r.id='listfixture0001';r.set('age_group',JSON.stringify(['children','adults']));r.set('specialization_type','Education, Psychology');r.set('profile_photo','portrait.jpg');r.set('public_name_en','Expert');app.save(r);
 const empty=new Record(c);empty.id='emptyfixture001';empty.set('age_group','[]');empty.set('specialization_type',JSON.stringify(['Counselling']));app.save(empty);
 });`)
 const file='1795400000_expert_text_lists.js';fs.copyFileSync(path.join('pb_migrations',file),path.join(migrations,file))
 assert.equal(fs.readFileSync(path.join('pb_migrations',file),'utf8'),fs.readFileSync(path.join('backend/pb/pb_migrations',file),'utf8'))
 fs.writeFileSync(path.join(migrations,'1795400001_verify.js'),`migrate(app=>{
 const r=app.findRecordById('expert_profiles','listfixture0001');if(r.getString('age_group')!=='children, adults'||r.getString('specialization_type')!=='Education, Psychology'||r.getString('profile_photo')!=='portrait.jpg'||r.getString('public_name_en')!=='Expert')throw Error('Profile data changed');
 const e=app.findRecordById('expert_profiles','emptyfixture001');if(e.getString('age_group')!==''||e.getString('specialization_type')!=='Counselling')throw Error('List conversion failed');
 });`)
 const result=spawnSync(path.resolve('../work/pocketbase-0.31.0/pocketbase.exe'),['migrate','up','--dir',path.join(root,'data'),'--migrationsDir',migrations],{encoding:'utf8',windowsHide:true})
 assert.equal(result.status,0,result.stdout+result.stderr);assert.match(result.stdout+result.stderr,/Applied 1795400001_verify/)
})
