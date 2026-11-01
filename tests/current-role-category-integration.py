from pathlib import Path
import tempfile,subprocess,socket,time,urllib.request,urllib.error,json,shutil
root=Path.cwd();stage=Path(tempfile.mkdtemp(prefix='dsc-current-category-'));runtime=root.parent/'work/pocketbase/pocketbase.exe'
for d in ['hooks/lib','migrations','data']:(stage/d).mkdir(parents=True,exist_ok=True)
for f in ['classification.pb.js','specialist-category.pb.js','lib/classification-validation.js']:shutil.copy2(root/'pb_hooks'/f,stage/'hooks'/f)
fixture='''migrate(app=>{
const testAdmin=new Record(app.findCollectionByNameOrId('_superusers'));testAdmin.set('email','fixture@category.example.test');testAdmin.set('password','PrivateCategoryFixture123!');app.save(testAdmin);
const cats=new Collection({name:'specialist_role_categories',type:'base',listRule:'',viewRule:'',deleteRule:'',fields:[{type:'text',name:'key'},{type:'text',name:'name_en'},{type:'text',name:'name_ar'},{type:'bool',name:'media_only'},{type:'bool',name:'is_active'}]});app.save(cats);
for(const [id,key,media] of [['medicalcat00001','medical',false],['customcat000001','custom-topic',false],['mediacat0000001','dsc-news',true]])app.save(new Record(cats,{id,key,name_en:key,name_ar:key,media_only:media,is_active:true}));
app.save(new Collection({name:'roles_management',type:'base',listRule:'',viewRule:'',createRule:'',updateRule:'',fields:[{type:'relation',name:'category',collectionId:cats.id,maxSelect:1},{type:'text',name:'role_name_en'},{type:'text',name:'role_name_ar'},{type:'number',name:'order'},{type:'bool',name:'is_active'}]}));
for(const name of ['blog_categories','blog_pages','programs','public_lectures'])app.save(new Collection({name,type:'base',fields:[{type:'text',name:'main_category'}]}));
});'''
(stage/'migrations/1000_fixture.js').write_text(fixture,encoding='utf-8')
result=subprocess.run([str(runtime),'migrate','up','--dir='+str(stage/'data'),'--migrationsDir='+str(stage/'migrations'),'--hooksDir='+str(stage/'hooks')],capture_output=True,text=True);assert result.returncode==0,result.stdout+result.stderr
with socket.socket() as s:s.bind(('127.0.0.1',0));port=s.getsockname()[1]
log=open(stage/'server.log','w',encoding='utf-8');server=subprocess.Popen([str(runtime),'serve','--http=127.0.0.1:'+str(port),'--dir='+str(stage/'data'),'--migrationsDir='+str(stage/'migrations'),'--hooksDir='+str(stage/'hooks'),'--automigrate=false'],stdout=log,stderr=log)
def request(path,method='GET',data=None):
 r=urllib.request.Request('http://127.0.0.1:'+str(port)+path,data=json.dumps(data).encode() if data is not None else None,method=method,headers={'Content-Type':'application/json'})
 try:
  with urllib.request.urlopen(r) as response:return response.status,json.load(response)
 except urllib.error.HTTPError as e:return e.code,json.load(e)
try:
 for i in range(50):
  try:
   if request('/api/health')[0]==200:break
  except Exception:time.sleep(.1)
 path='/api/collections/roles_management/records'
 for category,key in [('medicalcat00001','medical'),('customcat000001','custom-topic')]:
  status,role=request(path+'?expand=category','POST',{'category':category,'role_name_en':'Orthopedic Specialist','is_active':True,'order':37});assert status==200,(status,role)
  assert role['expand']['category']['key']==key and 'role_group' not in role
  status,updated=request(path+'/'+role['id']+'?expand=category','PATCH',{'role_name_en':'Edited name','is_active':False});assert status==200 and not updated['is_active'],(status,updated)
  status,error=request('/api/collections/specialist_role_categories/records/'+category,'DELETE');assert status==400 and 'contains roles' in error['message'],(status,error)
 for payload in [{'role_name_en':'No category'},{'category':'mediacat0000001','role_name_en':'Media role'}]:assert request(path,'POST',payload)[0]==400
 print('PASS: current schema without role_group supports expanded reads, role creation/editing, custom categories, availability and linked-category deletion protection')
finally:server.terminate();server.wait(timeout=5);log.close()
