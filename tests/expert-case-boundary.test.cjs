const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm')
class ForbiddenError extends Error {}
function user(role){return {getString:()=>role}}
test('expert accounts cannot create/update/delete cases or allocations, including with stale privileged auth',()=>{
 const hooks=[]
 const context={ForbiddenError,__hooks:'hooks',require:()=>({freshUser:()=>user('expert')}),onRecordCreateRequest:(fn,...names)=>hooks.push({fn,names}),onRecordUpdateRequest:(fn,...names)=>hooks.push({fn,names}),onRecordDeleteRequest:(fn,...names)=>hooks.push({fn,names})}
 vm.runInNewContext(fs.readFileSync('pb_hooks/expert-case-boundary.pb.js','utf8'),context)
 for(const {fn,names} of hooks){assert.deepEqual([...names],['cases','case_experts']);assert.throws(()=>fn({app:{},auth:user('admin'),hasSuperuserAuth:()=>false,next(){assert.fail('expert mutation continued')}}),/Experts cannot/)}
})
test('case mutation boundary preserves administrators, delegated accounts and server operations',()=>{
 for(const role of ['admin','super_admin','parent']) {
  let callback,next=0
  vm.runInNewContext(fs.readFileSync('pb_hooks/expert-case-boundary.pb.js','utf8'),{ForbiddenError,__hooks:'hooks',require:()=>({freshUser:()=>user(role)}),onRecordCreateRequest:fn=>callback=fn,onRecordUpdateRequest(){},onRecordDeleteRequest(){}})
  callback({auth:user(role),app:{},hasSuperuserAuth:()=>false,next(){next++}})
  callback({hasSuperuserAuth:()=>true,next(){next++}})
  assert.equal(next,2)
 }
})
test('custom allocation endpoint denies experts even when permissions are granted and permits authorized delegates',()=>{
 for(const role of ['expert','admin','parent']) {
  let route,reads=0
  const app={findRecordById(){reads++;return {id:'case'}},runInTransaction:fn=>fn(app),findRecordsByFilter:()=>[],findCollectionByNameOrId:()=>({})}
  vm.runInNewContext(fs.readFileSync('pb_hooks/allocation-save.pb.js','utf8'),{ForbiddenError,__hooks:'hooks',require:()=>({requirePermission:()=>user(role)}),routerAdd:(method,path,handler)=>route=handler,$apis:{requireAuth(){}}})
  const e={app,auth:user(role),request:{pathValue:()=> 'case'},requestInfo:()=>({body:{rows:[]}}),json:(status,body)=>({status,body})}
  if(role==='expert'){assert.throws(()=>route(e),/Experts cannot allocate/);assert.equal(reads,0)}
  else assert.equal(route(e).status,200)
 }
})
