const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs'), ts = require('typescript'), vm = require('node:vm')
function load(file, requireModule) {
 const result = {}
 new Function('exports', 'require', ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, target: ts.ScriptTarget.ES2020 } }).outputText)(result, requireModule)
 return result
}
const normalizer = load('lib/allocation-role-groups.ts', () => ({ EXPERT_CLASSIFICATIONS: [] }))
test('role repository expands category for list/read/create/update and uses current availability fields', async () => {
 const calls = [], raw = { id:'orthopedic', role_name_en:'Orthopedic Specialist', category:'medical-id', is_active:true, order:37, tool_types:[], expand:{category:{id:'medical-id',key:'medical',is_active:true}} }
 const client = { collection(name) { return {
  getOne: async (id,options) => { calls.push({name,options});return raw },
  create: async (data,options) => { calls.push({name,data,options});return raw },
  update: async (id,data,options) => { calls.push({name,data,options});return raw },
 } } }
 const module = load('lib/pb-collections.ts', name => name==='./allocation-role-groups' ? normalizer : name==='./pb' ? {__esModule:true,default:client} : name==='@/lib/bounded-records' ? {boundedFullList:async(col,options)=>{calls.push({options});return [raw]}} : {})
 const repo=module.rolesManagementCollection
 assert.equal((await repo.getAll())[0].role_group,'medical')
 assert.equal((await repo.getById(raw.id)).role_order,37)
 await repo.update(raw.id,{role_name_en:'Orthopedics'})
 const payload={role_name_en:'Orthopedics',role_name_ar:'طب العظام',category:'medical-id',is_active:true,order:38}
 await repo.create(payload)
 for(const call of calls) assert.equal(call.options.expand,'category,tool_types')
 assert.deepEqual(calls.at(-1).data,payload)
 assert.equal(Object.hasOwn(calls.at(-1).data,'role_group'),false)
})
test('classification request and model hooks validate the current category relation without any legacy column', () => {
 class BadRequestError extends Error {}
 const backendModule = {exports:{}}
 vm.runInNewContext(fs.readFileSync('pb_hooks/lib/classification-validation.js','utf8'),{module:backendModule,BadRequestError})
 const validation = backendModule.exports
 const category = {getBool:key=>false,getString:key=>'medical'}
 const record = id => ({collection:()=>({name:'roles_management'}),getString:key=>{assert.equal(key,'category');return id}})
 const app={findRecordById:(collection,id)=>{assert.equal(collection,'specialist_role_categories');assert.equal(id,'medical-id');return category}}
 validation({record:record('medical-id'),app})
 assert.throws(()=>validation({record:record(''),app}),/professional classification/)
 let modelHook
 vm.runInNewContext(fs.readFileSync('pb_hooks/specialist-category.pb.js','utf8'),{BadRequestError,onRecordCreate(){},onRecordUpdate:(fn,name)=>{if(name==='roles_management')modelHook=fn}})
 let next=0
 modelHook({record:record('medical-id'),app,next(){next++}})
 assert.equal(next,1)
 assert.throws(()=>modelHook({record:record(''),app,next(){}}),/professional classification/)
 assert.throws(()=>validation({record:record('medical-id'),app:{findRecordById:()=>({getBool:()=>true,getString:()=> 'dsc-news'})}}),/professional classification/)
})
test('allocation role creation resolves the selected category and writes its relation', async () => {
 let payload
 const repo={create:async data=>{payload=data;return {id:'new-role',...data}}}
 const client={filter:(filter,bindings)=>{assert.equal(bindings.key,'custom-topic');assert.match(filter,/is_active = true/);return filter},collection:name=>{assert.equal(name,'specialist_role_categories');return {getFirstListItem:async()=>({id:'custom-category-id'})}}}
 const hook=load('hooks/useRolesManagement.ts',name=>name==='react'?{useState:value=>[value,()=>{}],useEffect(){},useCallback:fn=>fn}:name==='@/lib/pb'?{__esModule:true,default:client}:name==='@/lib/pb-collections'?{rolesManagementCollection:repo}:{})
 await hook.useRolesManagement().addRole('Custom specialist','متخصص','custom-topic')
 assert.equal(payload.category,'custom-category-id')
 assert.equal(payload.is_active,true)
 assert.equal(Object.hasOwn(payload,'role_group'),false)
 assert.equal(Object.hasOwn(payload,'is_retired'),false)
})
