import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import net from 'node:net'
import {spawn,spawnSync} from 'node:child_process'

test('expert submission is atomic, retries are idempotent, and cleanup removes only unlinked failed attempts',async()=>{
 const folder=fs.mkdtempSync(path.join(os.tmpdir(),'dsc-expert-submit-'))
 const migrations=path.join(folder,'migrations');fs.mkdirSync(migrations)
 const fields=['country_of_residence','city','whatsapp_country_code','whatsapp_number','highest_academic_degree','degree_title','field_of_study','specialization_type','consultation_mode','public_name_en','public_name_ar','public_qualification_en','public_qualification_ar','public_specialty_en','public_specialty_ar','short_bio_en','short_bio_ar','availability','fee','status']
 fs.writeFileSync(path.join(migrations,'1000_fixture.js'),`migrate(app=>{
 const users=app.findCollectionByNameOrId('users');users.createRule='';users.listRule='';users.viewRule='';
 for(const f of [new TextField({name:'name'}),new TextField({name:'role'}),new BoolField({name:'is_active'})])if(!users.fields.getByName(f.name))users.fields.add(f);app.save(users);
 const profiles=new Collection({name:'expert_profiles',type:'base',listRule:'',fields:[{name:'user',type:'relation',collectionId:users.id,required:true,maxSelect:1},...${JSON.stringify(fields)}.map(name=>({name,type:'text',max:250})),{name:'age_group',type:'json'},{name:'specialist_roles',type:'json'},{name:'cv',type:'file',maxSelect:2,maxSize:1024,mimeTypes:['application/pdf']},{name:'profile_photo',type:'file',maxSelect:1,maxSize:1024,mimeTypes:['image/png']}]});app.save(profiles);
 const banks=new Collection({name:'expert_bank_details',type:'base',fields:[{name:'user',type:'relation',collectionId:users.id,maxSelect:1},{name:'iban',type:'text',pattern:'^GB'}]});app.save(banks);
 const cases=new Collection({name:'cases',type:'base',fields:[{name:'expert',type:'relation',collectionId:users.id,maxSelect:1}]});app.save(cases);
 function make(email,active,role){const u=new Record(users);u.set('email',email);u.set('password','TestPassword123!');u.set('role',role||'expert');u.set('is_active',!!active);app.save(u);return u}
 const failed=make('failed@example.test');app.save(new Record(banks,{user:failed.id,iban:'GB82WEST12345698765432'}));
 make('active@example.test',true);make('individual@example.test',false,'individual');
 const complete=make('complete@example.test');app.save(new Record(profiles,{user:complete.id,public_name_en:'Complete',public_name_ar:'مكتمل'}));
 const linked=make('linked@example.test');app.save(new Record(cases,{expert:linked.id}));
 });`)
 for(const file of ['1793600000_expert_submission.js','1793600100_remove_incomplete_expert_attempts.js'])fs.copyFileSync(path.resolve('pb_migrations',file),path.join(migrations,file))
 fs.writeFileSync(path.join(migrations,'1793600101_verify.js'),`migrate(app=>{
 if(app.findRecordsByFilter('users','email = "failed@example.test"','',0).length)throw Error('Failed attempt retained');
 if(app.findRecordsByFilter('expert_bank_details','', '',0).length)throw Error('Orphan bank retained');
 for(const email of ['active@example.test','complete@example.test','linked@example.test','individual@example.test'])if(!app.findRecordsByFilter('users','email = {:email}','',1,0,{email}).length)throw Error('Protected account removed: '+email);
 });`)
 const binary=path.resolve('../work/pocketbase-0.31.0/pocketbase.exe')
 const args=['migrate','up','--dir',path.join(folder,'data'),'--migrationsDir',migrations]
 const migrated=spawnSync(binary,args,{encoding:'utf8',windowsHide:true})
 assert.match(migrated.stdout+migrated.stderr,/Applied 1793600101_verify/,migrated.stdout+migrated.stderr)
 const hooks=path.join(folder,'hooks');fs.mkdirSync(path.join(hooks,'lib'),{recursive:true})
 for(const file of ['expert-registration.pb.js','lib/expert-submission.js'])fs.copyFileSync(path.resolve('pb_hooks',file),path.join(hooks,file))
 const port=await new Promise(resolve=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const port=s.address().port;s.close(()=>resolve(port))})})
 const server=spawn(binary,['serve','--dir',path.join(folder,'data'),'--migrationsDir',migrations,'--hooksDir',hooks,'--http',`127.0.0.1:${port}`],{windowsHide:true})
 let logs='';server.stdout.on('data',x=>logs+=x);server.stderr.on('data',x=>logs+=x)
 try{
 const base=`http://127.0.0.1:${port}`
 let healthy=false
 for(let i=0;i<100;i++){if(server.exitCode!==null)throw Error(logs);try{if((await fetch(base+'/api/health')).ok){healthy=true;break}}catch{}await new Promise(r=>setTimeout(r,30))}
 assert.ok(healthy,logs)
 const profile={public_name_en:'Expert Name',public_name_ar:'اسم الخبير',short_bio_ar:'نبذة',specialist_roles:[],age_group:['7-12']}
 async function submit(email,key,options={}){
 const body=new FormData();body.set('email',email);body.set('password','TestPassword123!');body.set('passwordConfirm','TestPassword123!');body.set('profile',JSON.stringify({...profile,...options.profile}));body.set('submission_key',key)
 if(options.file)body.append('cv',options.file)
 if(options.iban)body.set('expert_iban',options.iban)
 const response=await fetch(base+'/api/dsc/expert-register',{method:'POST',body});return {status:response.status,body:await response.json()}
 }
 async function count(email){return (await(await fetch(base+'/api/collections/users/records?filter='+encodeURIComponent('email = '+JSON.stringify(email)))).json()).totalItems}
 const invalid=await submit('bad@example.test','bad-profile-123456789',{profile:{public_name_ar:''}});assert.equal(invalid.status,400);assert.equal(await count('bad@example.test'),0)
 const badFile=await submit('badfile@example.test','bad-file-123456789',{file:new File(['invalid'],'bad.txt',{type:'text/plain'})});assert.equal(badFile.status,400,JSON.stringify(badFile));assert.equal(await count('badfile@example.test'),0)
 const badBank=await submit('badbank@example.test','bad-bank-123456789',{iban:'DE89370400440532013000'});assert.equal(badBank.status,400,JSON.stringify(badBank));assert.equal(await count('badbank@example.test'),0)
 const first=await submit('new@example.test','valid-submit-123456789',{file:new File(['%PDF-1.4 test'],'cv.pdf',{type:'application/pdf'})});assert.equal(first.status,200,JSON.stringify(first));assert.ok(first.body.token);assert.equal(await count('new@example.test'),1)
 const savedUsers=await(await fetch(base+'/api/collections/users/records?filter='+encodeURIComponent('email = "new@example.test"'))).json()
 assert.equal(savedUsers.items[0].role,'expert');assert.equal(savedUsers.items[0].is_active,false)
 const retry=await submit('new@example.test','valid-submit-123456789');assert.equal(retry.status,200,JSON.stringify(retry));assert.equal(retry.body.id,first.body.id);assert.equal(await count('new@example.test'),1)
 const duplicate=await submit('new@example.test','different-submit-12345');assert.equal(duplicate.status,400);assert.equal(await count('new@example.test'),1)
 const bypass=await fetch(base+'/api/collections/users/records',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'bypass@example.test',password:'TestPassword123!',passwordConfirm:'TestPassword123!',role:'expert'})});assert.equal(bypass.status,400);assert.equal(await count('bypass@example.test'),0)
 }finally{await new Promise(resolve=>{if(server.exitCode!==null)return resolve();server.once('exit',resolve);server.kill()})}
})
