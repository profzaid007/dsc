import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import net from 'node:net'
import {spawn,spawnSync} from 'node:child_process'
import {createRequire} from 'node:module'
const require=createRequire(import.meta.url)
const {make}=require('./assessment-engine.test.cjs')
test('assessment routes enforce access, pin versions, calculate server-side and preserve completed results',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'dsc-assessments-')),migrations=path.join(dir,'migrations'),hooks=path.join(dir,'hooks')
 fs.mkdirSync(migrations);fs.mkdirSync(path.join(hooks,'lib'),{recursive:true})
 fs.writeFileSync(path.join(migrations,'1000_fixture.js'),`migrate(app=>{
 const bootstrap=new Record(app.findCollectionByNameOrId('_superusers'));bootstrap.set('email','fixture-bootstrap@example.test');bootstrap.set('password','TestingBootstrap2026!');app.save(bootstrap);
 const users=app.findCollectionByNameOrId('users');for(const f of [new TextField({name:'name'}),new TextField({name:'role'}),new BoolField({name:'is_active'})])users.fields.add(f);app.save(users);
 function user(email,role){const r=new Record(users);r.set('email',email);r.set('password','TestPassword123!');r.set('role',role);r.set('name',role);r.set('is_active',true);app.save(r);return r}
 const admin=user('admin@example.test','super_admin'),expert=user('expert@example.test','expert'),other=user('other@example.test','expert'),denied=user('denied@example.test','admin'),owner=user('client@example.test','individual'),stranger=user('stranger@example.test','individual');
 const cases=new Collection({name:'cases',type:'base'});cases.fields.add(new TextField({name:'name'}));cases.fields.add(new RelationField({name:'user',collectionId:users.id,maxSelect:1}));app.save(cases);const c=new Record(cases);c.set('name','Case');c.set('user',owner.id);app.save(c);
 const links=new Collection({name:'case_experts',type:'base'});links.fields.add(new RelationField({name:'case_id',collectionId:cases.id,maxSelect:1}));links.fields.add(new RelationField({name:'expert_id',collectionId:users.id,maxSelect:1}));app.save(links);const l=new Record(links);l.set('case_id',c.id);l.set('expert_id',expert.id);app.save(l);
 });`)
 for(const name of ['1793800000_assessment_engine.js','1793900000_assessment_client_delivery.js'])fs.copyFileSync('pb_migrations/'+name,path.join(migrations,name))
 for(const f of ['assessments.pb.js','lib/assessments-api.js','lib/assessment-engine.js','assessment-delivery.pb.js','lib/assessment-delivery.js'])fs.copyFileSync('pb_hooks/'+f,path.join(hooks,f))
 fs.writeFileSync(path.join(hooks,'fixture.pb.js'),`routerAdd('POST','/__fixture/reassign/{id}',e=>{if(!e.auth||e.auth.getString('role')!=='super_admin')throw new ForbiddenError();const c=e.app.findRecordById('cases',e.request.pathValue('id'));const u=e.app.findFirstRecordByFilter('users','email = "stranger@example.test"');c.set('user',u.id);e.app.save(c);return e.json(200,{ok:true})},$apis.requireAuth('users'));`)
 fs.writeFileSync(path.join(hooks,'lib/security-policy.js'),`module.exports={freshUser(app,u){if(!u)throw new ForbiddenError();const r=app.findRecordById('users',u.id);if(!r.getBool('is_active'))throw new ForbiddenError();return r},effective(){return []}}`)
 const binary=path.resolve('../work/pocketbase-0.31.0/pocketbase.exe'),data=path.join(dir,'data')
 const migrate=spawnSync(binary,['migrate','up','--dir',data,'--migrationsDir',migrations,'--hooksDir',hooks],{encoding:'utf8',windowsHide:true})
 assert.match(migrate.stdout+migrate.stderr,/Applied 1793800000_assessment_engine/,migrate.stdout+migrate.stderr)
 const port=await new Promise(resolve=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>resolve(p))})})
 const server=spawn(binary,['serve','--dir',data,'--migrationsDir',migrations,'--hooksDir',hooks,'--http',`127.0.0.1:${port}`],{windowsHide:true});let logs='';server.stdout.on('data',s=>logs+=s);server.stderr.on('data',s=>logs+=s)
 try{
  const base=`http://127.0.0.1:${port}`
  for(let i=0;i<100;i++){try{if((await fetch(base+'/api/health')).ok)break}catch{}await new Promise(r=>setTimeout(r,30))}
  async function call(route,token,body){const r=await fetch(base+route,{method:body===undefined?'GET':'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:token}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});const data=await r.json();return {status:r.status,data}}
  async function login(who){const r=await call('/api/collections/users/auth-with-password',null,{identity:who+'@example.test',password:'TestPassword123!'});assert.equal(r.status,200);return r.data.token}
  const admin=await login('admin'),expert=await login('expert'),other=await login('other'),denied=await login('denied')
  assert.notEqual((await call('/api/dsc/assessments',null)).status,200)
  assert.notEqual((await call('/api/dsc/assessments',denied)).status,200)
  const d=make();let r=await call('/api/dsc/assessments/save',admin,{definition:d});assert.equal(r.status,200,JSON.stringify(r));const id=r.data.id
  r=await call('/api/dsc/assessments/'+id,admin);assert.equal(r.status,200,JSON.stringify(r));assert.ok(r.data.definition.questions,JSON.stringify(r));assert.equal(r.data.definition.questions.length,2)
  assert.notEqual((await call('/api/dsc/assessments/'+id+'/publish',admin,{})).status,200)
  assert.notEqual((await call('/api/dsc/assessments/'+id,expert)).status,200)
  r=await call('/api/dsc/assessments/'+id+'/preview',admin,{answers:{q1:'b',q2:'a'}});assert.equal(r.status,200,JSON.stringify(r));assert.equal(r.data.scores[0].value,8)
  r=await call('/api/dsc/assessments/'+id+'/publish',admin,{});assert.equal(r.status,200,JSON.stringify(r))
  assert.notEqual((await call('/api/dsc/assessments/save',admin,{id,definition:{...d,name:'Mutated'}})).status,200)
  const list=(await call('/api/dsc/assessments',expert)).data;assert.equal(list.cases.length,1)
  const caseId=list.cases[0].id
  assert.notEqual((await call('/api/dsc/assessment-sessions',other,{assessment:id,case:caseId})).status,200)
  r=await call('/api/dsc/assessment-sessions',expert,{assessment:id,case:caseId});assert.equal(r.status,200,JSON.stringify(r));const sid=r.data.id
  r=await call('/api/dsc/assessment-sessions/'+sid+'/submit',expert,{answers:{q1:'b',q2:'a'},finalize:false});assert.equal(r.status,200,JSON.stringify(r));assert.equal(r.data.answers.q1,'b')
  r=await call('/api/dsc/assessments/'+id+'/clone',admin,{version:'2'});assert.equal(r.status,200,JSON.stringify(r));const clone=r.data
  clone.definition.questions[0].weight=100;assert.equal((await call('/api/dsc/assessments/save',admin,{id:clone.id,definition:clone.definition})).status,200)
  r=await call('/api/dsc/assessment-sessions/'+sid+'/submit',expert,{answers:{q1:'b',q2:'a'},finalize:true,result:{scores:[{value:999}]}});assert.equal(r.status,200,JSON.stringify(r));assert.equal(r.data.result.scores[0].value,8);assert.equal(r.data.snapshot.version,'1');assert.equal(r.data.status,'completed')
  assert.notEqual((await call('/api/dsc/assessment-sessions/'+sid+'/submit',expert,{answers:{q1:'a'},finalize:false})).status,200)
  assert.notEqual((await call('/api/dsc/assessment-sessions/'+sid,other)).status,200)
  assert.notEqual((await call('/api/collections/assessment_results/records',expert,{session:sid,result:{value:999}})).status,200)
  const client=await login('client'),stranger=await login('stranger')
  let assigned=await call('/api/dsc/assessment-sessions/assign',expert,{assessment:id,case:caseId});assert.equal(assigned.status,200,JSON.stringify(assigned));const assignedId=assigned.data.id
  assert.equal(assigned.data.status,'assigned');assert.ok(assigned.data.recipient)
  assert.equal((await call('/api/dsc/assessment-sessions/assign',expert,{assessment:id,case:caseId})).data.id,assignedId)
  assert.notEqual((await call('/api/dsc/assessment-sessions/assign',stranger,{assessment:id,case:caseId})).status,200)
  assert.equal((await call('/api/dsc/cases/'+caseId+'/assessments',expert)).data.sessions.length,2)
  assert.notEqual((await call('/api/dsc/cases/'+caseId+'/assessments',client)).status,200)
  assert.equal((await call('/api/dsc/my-assessments',client)).data.sessions.length,1)
  assert.equal((await call('/api/dsc/my-assessments',stranger)).data.sessions.length,0)
  r=await call('/api/dsc/my-assessments/'+assignedId,client);assert.equal(r.status,200,JSON.stringify(r))
  assert.deepEqual(Object.keys(r.data.questions[0]).sort(),['id','options','order','text'])
  assert.deepEqual(Object.keys(r.data.questions[0].options[0]).sort(),['id','label'])
  for(const key of ['result','snapshot','population','indicators','bands','alerts','dimensions','totalRule'])assert.equal(key in r.data,false,key+' leaked')
  assert.notEqual((await call('/api/dsc/my-assessments/'+assignedId,stranger)).status,200)
  assert.notEqual((await call('/api/dsc/assessment-sessions/'+assignedId,client)).status,200)
  assert.notEqual((await call('/api/dsc/assessment-sessions/'+assignedId+'/submit',expert,{answers:{q1:'b',q2:'a'},finalize:true})).status,200)
  r=await call('/api/dsc/my-assessments/'+assignedId+'/submit',client,{answers:{q1:'b'},finalize:false});assert.equal(r.status,200,JSON.stringify(r));assert.equal(r.data.status,'in_progress')
  assert.equal((await call('/api/dsc/my-assessments/'+assignedId,client)).data.answers.q1,'b')
  assert.notEqual((await call('/api/dsc/my-assessments/'+assignedId+'/submit',client,{answers:{q1:'b'},finalize:true})).status,200)
  assert.notEqual((await call('/api/dsc/my-assessments/'+assignedId+'/submit',client,{answers:{q1:'invalid',q2:'a'},finalize:true})).status,200)
  r=await call('/api/dsc/my-assessments/'+assignedId+'/submit',client,{answers:{q1:'b',q2:'a'},finalize:true,result:{scores:[{value:999}]},recipient:'bad'});assert.equal(r.status,200,JSON.stringify(r));assert.equal(r.data.status,'completed');assert.ok(r.data.submitted_at);assert.equal('result' in r.data,false)
  const professional=await call('/api/dsc/assessment-sessions/'+assignedId,expert);assert.equal(professional.data.result.scores[0].value,8)
  assert.notEqual((await call('/api/dsc/my-assessments/'+assignedId+'/submit',client,{answers:{q1:'a',q2:'b'},finalize:false})).status,200)
  assert.equal((await call('/__fixture/reassign/'+caseId,admin,{})).status,200)
  assert.notEqual((await call('/api/dsc/my-assessments/'+assignedId,client)).status,200)
  assert.equal((await call('/api/dsc/my-assessments',client)).data.sessions.length,0)
  assert.notEqual((await call('/api/dsc/my-assessments/'+assignedId,stranger)).status,200)


 }finally{await new Promise(resolve=>{if(server.exitCode!==null)return resolve();server.once('exit',resolve);server.kill()})}
})
