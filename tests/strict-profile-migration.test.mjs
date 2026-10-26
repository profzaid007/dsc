import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import {spawnSync} from 'node:child_process'
for(const invalid of [false,true])test(invalid?'incompatible records stop migration with correction details':'strict migration changes age storage and sets missing payment status to unpaid',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'dsc-strict-contract-'));const migrations=path.join(dir,'migrations');fs.mkdirSync(migrations)
 fs.writeFileSync(path.join(migrations,'1000_fixture.js'),`migrate(app=>{
 function make(name,fields){const c=new Collection({name,type:'base',fields});app.save(c);return c}
 const roles=make('roles_management',[{name:'role_group',type:'text'}]);const role=new Record(roles);role.set('role_group',${JSON.stringify(invalid?'':'education')});app.save(role);
 make('expert_profiles',[{name:'age_group',type:'json'},{name:'specialization_type',type:'text'},{name:'preferred_languages',type:'text'},{name:'client_type',type:'text'}]);
 const cases=make('cases',[{name:'status',type:'text'},{name:'is_paid',type:'bool'}]);const row=new Record(cases);row.set('is_paid',true);app.save(row);
 });`)
 const name='1794500000_strict_profile_and_payment.js';fs.copyFileSync(path.resolve('pb_migrations',name),path.join(migrations,name))
 fs.writeFileSync(path.join(migrations,'1794500001_verify.js'),`migrate(app=>{
 const c=app.findCollectionByNameOrId('expert_profiles');if(c.fields.getByName('age_group').type()!=='text')throw Error('Wrong storage');
 const row=app.findAllRecords('cases')[0];if(row.getString('status')!=='awaiting_payment'||row.getBool('is_paid'))throw Error('Payment state incorrect');
 });`)
 const r=spawnSync(path.resolve('../work/pocketbase-0.31.0/pocketbase.exe'),['migrate','up','--dir',path.join(dir,'data'),'--migrationsDir',migrations],{encoding:'utf8',windowsHide:true});const log=r.stdout+r.stderr
 assert.match(log,invalid?/Correct these records.*roles_management/:/Applied 1794500001_verify/,log)
})
