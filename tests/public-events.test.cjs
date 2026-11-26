const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')
function load() {
  const calls = []
  const rows = [{id:'published',status:'published'}, {id:'completed',status:'completed'}, {id:'draft',status:'draft'}, {id:'cancelled',status:'cancelled'}]
  class AnonymousClient {
    collection(name) {
      return {
        name,
        async getOne(id, options) {
          calls.push({name,id,options})
          if(id==='missing') throw {status:404}
          if(id==='offline') throw {status:503}
          return rows.find(row=>row.id===id)
        },
      }
    }
  }
  const state={exports:{}}
  const mocks={
    'server-only':{}, react:{cache:fn=>fn}, pocketbase:{__esModule:true,default:AnonymousClient},
    '@/lib/bounded-records':{boundedFullList:async(service,options)=>{calls.push({name:service.name,options});return service.name==='programs'?rows.filter(row=>['published','completed'].includes(row.status)):rows}},
    '@/lib/pb-lectures':{lectureFromDB:row=>row}, '@/lib/pb-training':{programFromDB:row=>row}, '@/lib/classification':{mainCategoryKey:String},
  }
  const code=ts.transpileModule(fs.readFileSync('lib/public-events.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText
  new Function('exports','require',code)(state.exports,name=>mocks[name])
  return {...state.exports,calls}
}
test('public lists contain published/completed events and exclude drafts/cancellations',async()=>{
 const api=load()
 assert.deepEqual((await api.getPublicLectures()).map(row=>row.id),['published','completed'])
 assert.deepEqual((await api.getPublicPrograms()).map(row=>row.id),['published','completed'])
 for(const call of api.calls){assert.ok(call.options.signal);assert.equal(call.options.requestKey,null)}
 assert.match(api.calls.find(call=>call.name==='programs').options.filter,/status = "published"/)
})
test('draft and missing details are not public; backend outages are not mistaken for missing records',async()=>{
 const api=load()
 for(const get of [api.getPublicLecture,api.getPublicProgram]){
  assert.equal(await get('draft'),null)
  assert.equal(await get('cancelled'),null)
  assert.equal(await get('missing'),null)
  assert.equal((await get('published')).id,'published')
  await assert.rejects(get('offline'),error=>error.status===503)
 }
})
