# Tests only a disposable database copy; never creates fixture records in the running local database.
from pathlib import Path
import sqlite3,subprocess,tempfile,socket,time,urllib.request
root=Path.cwd();runtime=root.parent/'work/pocketbase';stage=Path(tempfile.mkdtemp(prefix='child-assignments-rehearsal-'))
for folder in ['data','migrations','hooks']:(stage/folder).mkdir()
with sqlite3.connect((runtime/'pb_data/data.db').resolve().as_uri()+'?mode=ro',uri=True) as a,sqlite3.connect(stage/'data/data.db') as b:a.backup(b)
import shutil
shutil.copy2(root/'pb_migrations/1794700200_tools_media.js',stage/'migrations/1794700200_tools_media.js')
(stage/'migrations/1794700100_private_expert_fixture.js').write_text('migrate(app=>{const settings=app.settings();settings.smtp.enabled=false;app.save(settings);const u=new Record(app.findCollectionByNameOrId("users"));u.set("email","media-test@example.test");u.set("name","Media tester");u.set("password","PrivateTest123!");u.set("role","super_admin");u.set("is_active",true);app.save(u)})',encoding='utf-8')
r=subprocess.run([str(runtime/'pocketbase.exe'),'migrate','up','--dir='+str(stage/'data'),'--migrationsDir='+str(stage/'migrations'),'--hooksDir='+str(stage/'hooks')],capture_output=True,text=True);print(r.stdout+r.stderr);assert 'Applied 1794700100_private_expert_fixture' in r.stdout+r.stderr
with socket.socket() as sock:sock.bind(('127.0.0.1',0));port=sock.getsockname()[1]
log=open(stage/'server.log','w');server=subprocess.Popen([str(runtime/'pocketbase.exe'),'serve','--http=127.0.0.1:'+str(port),'--dir='+str(stage/'data'),'--migrationsDir='+str(stage/'migrations'),'--hooksDir='+str(root/'pb_hooks'),'--automigrate=false'],stdout=log,stderr=log)
try:
 base='http://127.0.0.1:'+str(port)
 for attempt in range(40):
  try:
   with urllib.request.urlopen(base+'/api/health',timeout=1):break
  except Exception:time.sleep(.1)
 script="""import assert from 'node:assert/strict';const base=process.argv[1];for (const email of ['media-test@example.test','unknown-mail@example.test']){const r=await fetch(base+'/api/collections/users/request-password-reset',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email})});const d=await r.json();assert.equal(r.status,503);assert.equal(d.code,'password_reset_email_unavailable')}console.log('Verified: unconfigured email returns the same actionable 503 for known and unknown accounts; no reset email sent.');"""
 r=subprocess.run(['node','--input-type=module','-e',script,base],capture_output=True,text=True);print(r.stdout+r.stderr);assert r.returncode==0
finally:server.terminate();server.wait(timeout=8);log.close()
