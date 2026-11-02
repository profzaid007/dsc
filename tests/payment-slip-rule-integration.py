"""Receipt authorization regression; operates only on a disposable database clone."""
from pathlib import Path
import os,shutil,sqlite3,subprocess,tempfile,socket,time,urllib.request
root=Path.cwd(); runtime=Path(os.environ.get('PAYMENT_TEST_RUNTIME',str(root.parent/'work/pocketbase')))
binary=Path(os.environ.get('PAYMENT_TEST_BINARY',str(runtime/'pocketbase.exe')))
stage=Path(tempfile.mkdtemp(prefix='receipt-rule-'));(stage/'data').mkdir();(stage/'migrations').mkdir()
with sqlite3.connect((runtime/'pb_data/data.db').resolve().as_uri()+'?mode=ro',uri=True) as s,sqlite3.connect(stage/'data/data.db') as d:s.backup(d)
fixture=r'''migrate(app=>{
const settings=app.settings();settings.smtp.enabled=false;app.save(settings);
function user(email){const u=new Record(app.findCollectionByNameOrId('users'));u.set('email',email);u.set('role','parent');u.set('is_active',true);u.set('password','ReceiptTest123!');app.save(u);return u}
const owner=user('receipt-owner@example.test'),other=user('receipt-other@example.test');
const c=app.findCollectionByNameOrId('cases');c.updateRule='@request.auth.id != "" && @request.auth.is_active = true && user = @request.auth.id && @request.body.user:changed = false && @request.body.is_paid:changed = false && @request.body.payment_amount:changed = false && (@request.body.status:changed = false || @request.body.status = "under_review")';app.save(c);
const r=new Record(c);r.set('user',owner.id);r.set('name','Receipt regression fixture');r.set('status','awaiting_payment');r.set('payment_amount',500);app.save(r);
},()=>{});'''
(stage/'migrations/1795899999_receipt_fixture.js').write_text(fixture,encoding='utf-8')
shutil.copy2(root/'pb_migrations/1795900000_payment_rule_compatibility.js',stage/'migrations/1795900000_payment_rule_compatibility.js')
args=[str(binary),'--dir='+str(stage/'data'),'--migrationsDir='+str(stage/'migrations'),'--hooksDir='+str(root/'pb_hooks')]
r=subprocess.run([args[0],'migrate','up',*args[1:]],capture_output=True,text=True);print(r.stdout+r.stderr);assert r.returncode==0
with sqlite3.connect(stage/'data/data.db') as d:
 for name in ['cases','case_tools','case_feedback']:
  rule=d.execute('select updateRule from _collections where name=?',(name,)).fetchone()[0]
  assert not rule or ':changed' not in rule,name
with socket.socket() as sock:sock.bind(('127.0.0.1',0));port=sock.getsockname()[1]
log=open(stage/'server.log','w');server=subprocess.Popen([args[0],'serve','--http=127.0.0.1:'+str(port),*args[1:],'--automigrate=false'],stdout=log,stderr=log)
script=r'''import assert from 'node:assert/strict';const base=process.argv[1];
async function req(path,token,method='GET',body){const r=await fetch(base+path,{method,headers:{Authorization:token||'','Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});return {status:r.status,data:await r.json()}}
async function login(identity){const r=await req('/api/collections/users/auth-with-password','','POST',{identity,password:'ReceiptTest123!'});assert.equal(r.status,200);return r.data}
const owner=await login('receipt-owner@example.test'),other=await login('receipt-other@example.test');
const cases=await req('/api/collections/cases/records',owner.token);const c=cases.data.items.find(c=>c.name==='Receipt regression fixture');assert.ok(c);
const path='/api/collections/cases/records/'+c.id;
for(const change of [{status:'active'},{is_paid:true},{payment_amount:1},{user:other.record.id}])assert.equal((await req(path,owner.token,'PATCH',change)).status,404,JSON.stringify(change));
assert.equal((await req(path,other.token,'PATCH',{status:'under_review'})).status,404);
const body=new FormData();body.set('status','under_review');body.set('payment_reject_reason','');body.set('payment_slip',new Blob(['fixture receipt'],{type:'image/jpeg'}),'receipt.jpeg');
const upload=await fetch(base+path,{method:'PATCH',headers:{Authorization:owner.token},body});const record=await upload.json();assert.equal(upload.status,200,JSON.stringify(record));assert.equal(record.status,'under_review');assert.ok(record.payment_slip);assert.equal(record.payment_amount,500);assert.equal(record.is_paid,false);assert.equal(record.user,owner.record.id);
assert.ok([403,404].includes((await fetch(base+'/api/files/cases/'+c.id+'/'+record.payment_slip)).status));
console.log('PASS: owner receipt upload enters review; amount, paid status, ownership, foreign-case access and protected files remain restricted.');'''
try:
 for _ in range(40):
  try:urllib.request.urlopen('http://127.0.0.1:'+str(port)+'/api/health',timeout=1);break
  except Exception:time.sleep(.1)
 r=subprocess.run(['node','--input-type=module','-e',script,'http://127.0.0.1:'+str(port)],capture_output=True,text=True);print(r.stdout+r.stderr);assert r.returncode==0
finally:server.terminate();server.wait(timeout=10);log.close()
