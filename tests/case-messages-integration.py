# Private integration rehearsal: never writes fixture accounts into a running environment.
from pathlib import Path
import sqlite3, subprocess, tempfile, socket, time, urllib.request, urllib.error, json, shutil
root=Path.cwd(); runtime=root.parent/'work/pocketbase'; stage=Path(tempfile.mkdtemp(prefix='dsc-case-messages-'))
for name in ['data','migrations','hooks']: (stage/name).mkdir()
with sqlite3.connect((runtime/'pb_data/data.db').resolve().as_uri()+'?mode=ro',uri=True) as a, sqlite3.connect(stage/'data/data.db') as b: a.backup(b)
for migration in ['1794800000_case_messages.js','1794900000_case_documents.js']:shutil.copy2(root/'pb_migrations'/migration,stage/'migrations'/migration)
fixture='''migrate(app=>{
 const mail=app.settings();mail.smtp.enabled=false;app.save(mail);
 const users=app.findCollectionByNameOrId("users");
 function user(key,role){const u=new Record(users);u.set("email",key+"@messages.example.test");u.set("name",key);u.set("password","PrivateMessages123!");u.set("role",role);u.set("is_active",true);app.save(u);return u}
 const expert=user("allocated","expert"),foreign=user("foreign","expert"),admin=user("admin","super_admin"),other=user("other","parent"),deniedAdmin=user("denied-admin","admin");
 for(const role of ["parent","individual","organization","care_foundation"]){
  const owner=user(role,role),c=new Record(app.findCollectionByNameOrId("cases"));c.set("name","Message case "+role);c.set("user",owner.id);c.set("status","active");app.save(c);
  const a=new Record(app.findCollectionByNameOrId("case_experts"));a.set("case_id",c.id);a.set("expert_id",expert.id);app.save(a);
 }
 const c=new Record(app.findCollectionByNameOrId("cases"));c.set("name","Foreign allocation");c.set("user",other.id);c.set("status","active");app.save(c);
 const a=new Record(app.findCollectionByNameOrId("case_experts"));a.set("case_id",c.id);a.set("expert_id",foreign.id);app.save(a);
})'''
(stage/'migrations/1794800100_fixture.js').write_text(fixture,encoding='utf-8')
args=[str(runtime/'pocketbase.exe'),'migrate','up','--dir='+str(stage/'data'),'--migrationsDir='+str(stage/'migrations'),'--hooksDir='+str(stage/'hooks')]
p=subprocess.run(args,capture_output=True,text=True); assert p.returncode==0,p.stdout+p.stderr
with socket.socket() as s:s.bind(('127.0.0.1',0));port=s.getsockname()[1]
log=open(stage/'server.log','w',encoding='utf-8');server=subprocess.Popen([str(runtime/'pocketbase.exe'),'serve','--http=127.0.0.1:'+str(port),'--dir='+str(stage/'data'),'--migrationsDir='+str(stage/'migrations'),'--hooksDir='+str(root/'pb_hooks'),'--automigrate=false'],stdout=log,stderr=log)
base='http://127.0.0.1:'+str(port)
def req(path,token='',method='GET',body=None,file=None,file_field='attachments'):
 # Match PocketBase SDK: file-token POST requests have no JSON body.
 if path=='/api/files/token':body=None
 headers={}
 if token:headers['Authorization']=token
 data=None
 if file:
  boundary='DSCMessageBoundary'
  parts=[]
  for k,v in body.items():parts.append(('--'+boundary+'\r\nContent-Disposition: form-data; name="'+k+'"\r\n\r\n'+str(v)+'\r\n').encode())
  parts.append(('--'+boundary+'\r\nContent-Disposition: form-data; name="'+file_field+'"; filename="note.txt"\r\nContent-Type: text/plain\r\n\r\n').encode()+file+b'\r\n')
  parts.append(('--'+boundary+'--\r\n').encode());data=b''.join(parts);headers['Content-Type']='multipart/form-data; boundary='+boundary
 elif body is not None:data=json.dumps(body).encode();headers['Content-Type']='application/json'
 try:
  with urllib.request.urlopen(urllib.request.Request(base+path,data=data,headers=headers,method=method),timeout=10) as r:status=r.status;raw=r.read()
 except urllib.error.HTTPError as e:status=e.code;raw=e.read()
 try:return status,json.loads(raw)
 except Exception:return status,raw
try:
 for i in range(60):
  try:
   if req('/api/health')[0]==200:break
  except Exception:time.sleep(.1)
 def login(key):
  status,data=req('/api/collections/users/auth-with-password',method='POST',body={'identity':key+'@messages.example.test','password':'PrivateMessages123!'});assert status==200,(status,data);return data['token'],data['record']['id']
 tokens={};ids={}
 for role in ['allocated','foreign','admin','denied-admin','other','parent','individual','organization','care_foundation']:tokens[role],ids[role]=login(role)
 fileTokens={}
 for key in ['allocated','foreign','parent']:
  status,t=req('/api/files/token',tokens[key],'POST',{});assert status==200,(status,t);fileTokens[key]=t['token']
 with sqlite3.connect(stage/'data/data.db') as c:
  cases={role:c.execute('select id from cases where user=?',(ids[role],)).fetchone()[0] for role in ['parent','individual','organization','care_foundation','other']}
 path='/api/collections/internal_messages/records'; saved=None
 for role in ['parent','individual','organization','care_foundation']:
  case=cases[role];token=tokens[role]
  status,contacts=req('/api/dsc/message-contacts?case_id='+case,token);assert status==200,(status,contacts)
  contacts={r['id'] for r in contacts};assert ids['allocated'] in contacts and ids['admin'] in contacts and ids['foreign'] not in contacts and ids['other'] not in contacts and ids['denied-admin'] not in contacts
  data={'sender':ids[role],'recipient':ids['allocated'],'case':case,'subject':'Case discussion','body':'Please review https://example.com','read':'false'}
  status,m=req(path,token,'POST',data,b'Private attachment');assert status==200,(status,m)
  assert m['attachments'];saved=m if role=='parent' else saved
  assert req(path+'/'+m['id'],tokens['allocated'])[0]==200
  for bad in ['other','foreign']:
   assert req(path+'/'+m['id'],tokens[bad])[0]==404
   assert req('/api/dsc/message-contacts?case_id='+case,tokens[bad])[0] in [403,404]
  assert req(path,tokens[role],'POST',{**data,'recipient':ids['foreign']})[0] in [400,403]
  assert req(path,tokens[role],'POST',{**data,'recipient':ids['other']})[0] in [400,403]
  assert req(path,tokens[role],'POST',{**data,'sender':ids['allocated']})[0] in [400,403]
  assert req(path,tokens[role],'POST',{**data,'case':cases['other']})[0] in [400,403]
  assert req(path,tokens[role],'POST',{**data,'case':''})[0] in [400,403]
  assert req(path,tokens[role],'POST',{**data,'recipient':ids['denied-admin']})[0] in [400,403]
  assert req(path,tokens['allocated'],'POST',{**data,'sender':ids['allocated'],'recipient':ids[role],'body':'Reply'})[0]==200
  assert req(path,tokens[role],'POST',{**data,'recipient':ids['admin']})[0]==200
  assert req(path,tokens['admin'],'POST',{**data,'sender':ids['admin'],'recipient':ids[role]})[0]==200
  assert req(path+'/'+m['id'],tokens['allocated'],'PATCH',{'read':True})[0]==200
  assert req(path+'/'+m['id'],tokens['allocated'],'PATCH',{'body':'tampered'})[0] in [400,403]
  assert req(path+'/'+m['id'],tokens['allocated'],'PATCH',{'read':'true'},b'Replacement attachment')[0] in [400,403]
  assert req(path+'/'+m['id'],tokens[role],'PATCH',{'read':True})[0] in [400,403,404]
 print('PASS: parent, individual, organization and care-foundation messages, replies, admin access and forged requests')
 assert req('/api/dsc/message-contacts?case_id='+cases['parent'],tokens['denied-admin'])[0]==403
 invalid={'sender':ids['parent'],'recipient':ids['allocated'],'case':cases['parent'],'subject':'Invalid attachment','body':'Oversized file','read':'false'}
 assert req(path,tokens['parent'],'POST',invalid,b'x'*(10485760+1))[0] in [400,413]
 print('PASS: administrator permission checks, immutable files and attachment size limit')
 filePath='/api/files/'+saved['collectionId']+'/'+saved['id']+'/'+saved['attachments'][0]
 assert req(filePath)[0] in [400,403,404]
 t={'token':fileTokens['allocated']}
 assert req(filePath+'?token='+t['token'])[0]==200
 t={'token':fileTokens['foreign']}
 assert req(filePath+'?token='+t['token'])[0] in [400,403,404]

 documentPath='/api/collections/case_documents/records'
 documentBody={'case':cases['parent'],'uploaded_by':ids['allocated'],'title':'Expert document'}
 status,uploaded=req(documentPath,tokens['allocated'],'POST',documentBody,b'Expert document bytes',file_field='file');assert status==200,(status,uploaded)
 assert req(documentPath,tokens['parent'],'POST',{**documentBody,'uploaded_by':ids['parent']},b'forged',file_field='file')[0] in [400,403]
 assert req(documentPath,tokens['foreign'],'POST',{**documentBody,'uploaded_by':ids['foreign']},b'forged',file_field='file')[0] in [400,403]
 assert req(documentPath,tokens['allocated'],'POST',{**documentBody,'source_message':saved['id']},b'forged',file_field='file')[0] in [400,403]
 importPath='/api/dsc/cases/'+cases['parent']+'/documents/from-message'
 attachment={'message_id':saved['id'],'filename':saved['attachments'][0]}
 status,doc=req(importPath,tokens['allocated'],'POST',attachment);assert status==200,(status,doc)
 assert doc['case']==cases['parent'] and doc['source_message']==saved['id'] and doc['uploaded_by']==ids['allocated']
 status,again=req(importPath,tokens['allocated'],'POST',attachment);assert status==200 and again['id']==doc['id']
 for bad in ['parent','foreign','other']:
  assert req(importPath,tokens[bad],'POST',attachment)[0] in [400,403,404]
 assert req('/api/dsc/cases/'+cases['individual']+'/documents/from-message',tokens['allocated'],'POST',attachment)[0] in [400,403]
 assert req(importPath,tokens['allocated'],'POST',{**attachment,'filename':'../data.db'})[0]==400
 for user in ['parent','allocated','admin']:assert req(documentPath+'/'+doc['id'],tokens[user])[0]==200
 for user in ['foreign','other','denied-admin']:assert req(documentPath+'/'+doc['id'],tokens[user])[0] in [403,404]
 assert req(documentPath+'/'+doc['id'],tokens['allocated'],'PATCH',{'title':'altered'})[0] in [400,403,404]
 docFile='/api/files/'+doc['collectionId']+'/'+doc['id']+'/'+doc['file']
 assert req(docFile)[0] in [400,403,404]
 t={'token':fileTokens['parent']}
 status,contents=req(docFile+'?token='+t['token']);assert status==200 and contents==b'Private attachment',(status,contents)
 source=stage/'data/storage'/saved['collectionId']/saved['id']/saved['attachments'][0]
 assert source.is_file();source.unlink()  # disposable fixture only: saved document has an independent copy
 assert req(docFile+'?token='+t['token'])[0]==200
 print('PASS: document upload, private downloads, authorized import, duplicate prevention and independent file copies')
 # Remove allocation in this disposable copy and confirm historical data/files are inaccessible.
 with sqlite3.connect(stage/'data/data.db') as c:c.execute('delete from case_experts where case_id=? and expert_id=?',(cases['parent'],ids['allocated']))
 assert req(path+'/'+saved['id'],tokens['allocated'])[0]==404
 assert req('/api/dsc/message-contacts?case_id='+cases['parent'],tokens['allocated'])[0]==403
 assert req(documentPath+'/'+doc['id'],tokens['allocated'])[0]==404
 assert req(importPath,tokens['allocated'],'POST',attachment)[0]==403
 t={'token':fileTokens['allocated']}
 assert req(filePath+'?token='+t['token'])[0] in [400,403,404]
 print('PASS: protected attachments reject anonymous, unrelated and formerly allocated experts')
finally:
 server.terminate();server.wait(timeout=10);log.close()
 print('Private rehearsal:',stage)
