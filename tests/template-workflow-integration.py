from pathlib import Path
import shutil,sqlite3,subprocess,tempfile,socket,time,urllib.request
root=Path.cwd();runtime=root.parent/'work/pocketbase';stage=Path(tempfile.mkdtemp(prefix='template-workflow-'))
for f in ['data','migrations']:(stage/f).mkdir()
with sqlite3.connect((runtime/'pb_data/data.db').resolve().as_uri()+'?mode=ro',uri=True) as src,sqlite3.connect(stage/'data/data.db') as dst:src.backup(dst)
shutil.copy2(root/'pb_migrations/1795800000_private_tool_templates.js',stage/'migrations/1795800000_private_tool_templates.js')
fixture=r'''migrate(app=>{
const settings=app.settings();settings.smtp.enabled=false;app.save(settings);
function user(email,role){const u=new Record(app.findCollectionByNameOrId('users'));u.set('email',email);u.set('name',role);u.set('role',role);u.set('is_active',true);u.set('password','PrivateTest123!');app.save(u);return u}
const admin=user('tpl-admin@example.test','super_admin'),expert=user('tpl-expert@example.test','expert'),peer=user('tpl-peer@example.test','expert'),parent=user('tpl-parent@example.test','parent');
const c=new Record(app.findCollectionByNameOrId('cases'));c.set('name','Template fixture case');c.set('user',parent.id);c.set('status','active');app.save(c);
for(const u of [expert,peer]){const a=new Record(app.findCollectionByNameOrId('case_experts'));a.set('case_id',c.id);a.set('expert_id',u.id);app.save(a)}
const definition={name:'Template scale',code:'TPLTEST',version:'1',description:'',audience:'',instructions:'Original instructions',language:'ar',duration:10,type:'general',direction:'higher_problem',missingPolicy:'reject',minAnswered:1,dimensions:[],answerSets:[{id:'standard',name:'Options',options:[{id:'a',label:'Low',score:1},{id:'b',label:'High',score:3}]}],questions:[{id:'q1',order:1,text:'Original question',dimensions:[],weight:1,reverse:false,critical:false,answerSet:'standard'}],totalRule:{method:'sum'},indicators:[],bands:[],alerts:[]};
const a=new Record(app.findCollectionByNameOrId('assessments'));for(const k of ['name','code','version'])a.set(k,definition[k]);a.set('author',admin.id);a.set('status','published');a.set('definition',definition);a.set('tested',true);app.save(a);
const q=new Record(app.findCollectionByNameOrId('assessment_questions'));q.set('assessment',a.id);q.set('key','q1');q.set('position',1);q.set('definition',definition.questions[0]);app.save(q);
},()=>{});'''
(stage/'migrations/1999999999_template_fixture.js').write_text(fixture,encoding='utf-8')
args=[str(runtime/'pocketbase.exe'),'--dir='+str(stage/'data'),'--migrationsDir='+str(stage/'migrations'),'--hooksDir='+str(root/'pb_hooks')]
r=subprocess.run([args[0],'migrate','up',*args[1:]],capture_output=True,text=True);print(r.stdout+r.stderr);assert r.returncode==0
with socket.socket() as sock:sock.bind(('127.0.0.1',0));port=sock.getsockname()[1]
log=open(stage/'server.log','w');server=subprocess.Popen([args[0],'serve','--http=127.0.0.1:'+str(port),*args[1:],'--automigrate=false'],stdout=log,stderr=log)
script=r'''import assert from 'node:assert/strict';const base=process.argv[1];
async function req(path,token,method='GET',body){const r=await fetch(base+path,{method,headers:{Authorization:token||'','Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});return {status:r.status,data:await r.json()}}
async function login(identity){const r=await req('/api/collections/users/auth-with-password','','POST',{identity,password:'PrivateTest123!'});assert.equal(r.status,200);return r.data.token}
const admin=await login('tpl-admin@example.test'),expert=await login('tpl-expert@example.test'),peer=await login('tpl-peer@example.test'),parent=await login('tpl-parent@example.test');
const owned=await req('/api/collections/cases/records',expert);const caseId=owned.data.items.find(c=>c.name==='Template fixture case').id;
const configs={plan:{goals:[{id:'g',title:'Public goal'}],steps:[{id:'s',title:'Public step',completed:false}],childName:'DO NOT KEEP',expertName:'DO NOT KEEP'},report:{assessment:'Public instructions',suggestions:'Recommendation',customFields:[{id:'field',label:'Response',type:'textarea'}]},survey:{answerType:'single_choice',questions:[{id:'q',text:'Question',required:true,order:0}],options:[{value:'a',label:'Yes'}]},multiple_answer:{questions:[{id:'q',text:'Question',answerType:'text',required:true,order:0,options:[]}]}};
for(const kind of Object.keys(configs)){
 const pub=await req('/api/dsc/tool-templates',admin,'POST',{kind,name:'Public '+kind,config:configs[kind],owner:'forged'});assert.equal(pub.status,201,JSON.stringify(pub.data));assert.equal(pub.data.scope,'public');assert.equal(pub.data.config.childName,undefined);
 const detail=await req('/api/dsc/tool-templates/'+pub.data.id,expert);assert.equal(detail.status,200);const modified=structuredClone(detail.data.config);modified.instructions='Private edit';
 const priv=await req('/api/dsc/tool-templates',expert,'POST',{kind,name:'My '+kind,config:modified,source:pub.data.id,owner:''});assert.equal(priv.status,201,JSON.stringify(priv.data));assert.equal(priv.data.scope,'private');
 assert.equal((await req('/api/dsc/tool-templates/'+priv.data.id,peer)).status,403);
 const peers=await req('/api/dsc/tool-templates',peer);assert.ok(!peers.data.templates.some(t=>t.id===priv.data.id));
 const reviewPath='/api/dsc/tool-templates?review=1', privatePath='/api/dsc/tool-templates/'+priv.data.id;
 assert.ok((await req(reviewPath,admin)).data.templates.some(t=>t.id===priv.data.id&&t.scope==='private'));
 assert.equal((await req(privatePath,admin)).data.config.instructions,'Private edit');
 assert.ok(!(await req(reviewPath,peer)).data.templates.some(t=>t.id===priv.data.id));
 assert.equal((await req(privatePath+'/approve',expert,'POST',{})).status,403);
 assert.equal((await req('/api/dsc/tool-templates/'+pub.data.id,expert)).data.config.instructions,undefined);
 const draft=await req('/api/dsc/cases/'+caseId+'/template-drafts',expert,'POST',{source:priv.data.id,name:'Case '+kind,config:modified});assert.equal(draft.status,201,JSON.stringify(draft.data));assert.ok((await req('/api/dsc/cases/'+caseId+'/template-drafts',expert)).data.drafts.some(d=>d.id===draft.data.id));assert.ok(!(await req('/api/dsc/cases/'+caseId+'/template-drafts',peer)).data.drafts.some(d=>d.id===draft.data.id));assert.equal((await req('/api/dsc/cases/'+caseId+'/template-assignment',peer,'POST',{draft:draft.data.id})).status,403);
 const assigned=await req('/api/dsc/cases/'+caseId+'/template-assignment',expert,'POST',{draft:draft.data.id,case:'foreign',config:{forged:true}});assert.equal(assigned.status,201,JSON.stringify(assigned.data));
 assert.equal((await req('/api/dsc/cases/'+caseId+'/template-assignment',expert,'POST',{draft:draft.data.id})).data.id,assigned.data.id);
 const taskPath='/api/collections/case_tools/records/'+assigned.data.id;const task=await req(taskPath,parent);assert.equal(task.status,200);assert.equal(task.data.case,caseId);assert.equal(task.data.status,'assigned');assert.equal(task.data.config.childName,'Template fixture case');
 modified.instructions='Changed after sending';await req('/api/dsc/tool-templates',expert,'POST',{kind,name:'Later '+kind,config:modified,source:priv.data.id});assert.equal((await req(taskPath,parent)).data.config.instructions,'Private edit');
 assert.equal((await req(taskPath,parent,'PATCH',{responses:{general:'My response'},status:'completed'})).status,200);
 assert.equal((await req(taskPath,parent,'PATCH',{config:{forged:true}})).status,404);
 const approved=await req(privatePath+'/approve',admin,'POST',{config:{forged:true}});
 assert.equal(approved.status,200,JSON.stringify(approved.data));assert.equal(approved.data.id,priv.data.id);assert.equal(approved.data.scope,'public');
 assert.equal((await req(privatePath,peer)).data.config.instructions,'Private edit');
 assert.ok((await req('/api/dsc/tool-templates',peer)).data.templates.some(t=>t.id===priv.data.id&&t.scope==='public'));
 assert.equal((await req(privatePath+'/approve',admin,'POST',{})).data.id,priv.data.id);
}
const catalogue=await req('/api/dsc/tool-templates',expert);const scale=catalogue.data.templates.find(t=>t.name==='Template scale');assert.ok(scale);
const scaleDetail=await req('/api/dsc/tool-templates/'+scale.id,expert);const scaleConfig=scaleDetail.data.config;scaleConfig.questions[0].text='Customized question';
const privateScale=await req('/api/dsc/tool-templates',expert,'POST',{kind:'assessment',name:'My scale',source:scale.id,config:scaleConfig});assert.equal(privateScale.status,201,JSON.stringify(privateScale.data));
const scaleDraft=await req('/api/dsc/cases/'+caseId+'/template-drafts',expert,'POST',{source:privateScale.data.id,name:'Client scale',config:scaleConfig,population:{age:10}});assert.equal(scaleDraft.status,201,JSON.stringify(scaleDraft.data));const assignedScale=await req('/api/dsc/cases/'+caseId+'/template-assignment',expert,'POST',{draft:scaleDraft.data.id});assert.equal(assignedScale.status,201,JSON.stringify(assignedScale.data));
const clientScale=await req('/api/dsc/my-assessments/'+assignedScale.data.id,parent);assert.equal(clientScale.status,200,JSON.stringify(clientScale.data));assert.equal(clientScale.data.questions[0].text,'Customized question');assert.equal(clientScale.data.name,'Client scale');
assert.equal((await req('/api/dsc/tool-templates/'+scale.id,expert)).data.config.questions[0].text,'Original question');
assert.equal((await req('/api/dsc/cases/'+caseId+'/template-assignment',parent,'POST',{source:scale.id,name:'Forbidden',config:scaleConfig})).status,403);
const foreignCase=await req('/api/dsc/cases/notallocated/template-assignment',expert,'POST',{source:scale.id,name:'Forbidden',config:scaleConfig});assert.equal(foreignCase.status,403);
console.log('PASS: five template types, case-free public templates, account-private copies, cross-expert isolation, case-scoped snapshots, client response writes, assessment snapshot and unchanged originals.');'''
try:
 for _ in range(40):
  try:
   urllib.request.urlopen('http://127.0.0.1:'+str(port)+'/api/health',timeout=1);break
  except Exception:time.sleep(.1)
 r=subprocess.run(['node','--input-type=module','-e',script,'http://127.0.0.1:'+str(port)],capture_output=True,text=True);print(r.stdout+r.stderr);assert r.returncode==0
finally:server.terminate();server.wait(timeout=8);log.close()
