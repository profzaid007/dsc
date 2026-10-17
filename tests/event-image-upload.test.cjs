const {test}=require('node:test')
const assert=require('node:assert/strict')
const fs=require('node:fs')
const ts=require('typescript')
function load(file,mocks){
 const exports={}
 const source=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText
 new Function('exports','require',source)(exports,name=>{if(name in mocks)return mocks[name];throw Error(name)})
 return exports
}
test('event images reject unsupported types and oversize files',()=>{
 const {validateEventImage}=load('lib/event-image.ts',{})
 assert.equal(validateEventImage({type:'image/png',size:1024}),null)
 assert.equal(validateEventImage({type:'image/svg+xml',size:1024}),'type')
 assert.equal(validateEventImage({type:'image/jpeg',size:5*1024*1024+1}),'size')
})
for(const [kind,hookName,add,edit,collection] of [['training','useTraining','addProgram','updateProgram','trainingProgramsCollection'],['lectures','useLectures','addLecture','updateLecture','lecturesCollection']]){
 test(kind+' create and edit send image bytes as multipart and retain existing images without reupload',async()=>{
  const calls=[]
  const pb={files:{getUrl:(_r,name)=>'https://files.test/'+name},collection:()=>({create:async data=>{calls.push(data);return {id:'event',thumbnail:'saved.png',schedule:{},speaker:{}}},update:async(_id,data)=>{calls.push(data);return {id:'event',thumbnail:['saved.png'],schedule:{},speaker:{}}}})}
  const lib=load('lib/pb-'+kind+'.ts',{'./pb':{__esModule:true,default:pb},'@/lib/bounded-records':{boundedFullList:async()=>[]}})
  const hook=load('hooks/'+hookName+'.ts',{'react':{useState:value=>[value,()=>{}],useEffect(){},useCallback:fn=>fn},'@/lib/pb':{getErrorMessage:String},'@/lib/validators':{normalizeEmail:x=>x},['@/lib/pb-'+kind]:lib})[hookName]()
  const file=new File(['image bytes'],'test.png',{type:'image/png'})
  await hook[add]({thumbnail:file,title:{ar:'فعالية',en:'Event'},schedule:{mode:'online'}})
  await hook[edit]('event',{thumbnail:file,title:{ar:'تعديل',en:'Edit'},schedule:{mode:'in_person'}})
  for(const data of calls){assert.ok(data instanceof FormData);assert.equal(await data.get('thumbnail').text(),'image bytes')}
  assert.equal(JSON.parse(calls[0].get('schedule')).mode,'online')
  assert.equal(JSON.parse(calls[1].get('schedule')).mode,'in_person')
  await hook[edit]('event',{thumbnail:'https://files.test/saved.png'})
  assert.equal(calls[2] instanceof FormData,false)
  assert.equal(Object.hasOwn(calls[2],'thumbnail'),false)
  const saved=await lib[collection].create({title:{en:'Event'}},file)
  assert.equal(saved.thumbnail,'https://files.test/saved.png')
 })
}
