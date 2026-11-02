const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs')
function harness(role='expert',allocated=true){
 const records=[],audits=[]; const user={id:'expert-a',getString:()=>role};
 class Record{constructor(){this.id='';this.values={}}set(k,v){this.values[k]=v}}
 const app={runInTransaction:fn=>fn(app),findRecordsByFilter:name=>name==='case_experts'&&allocated?[{}]:[],findRecordById:(name,id)=>name==='cases'?{id,getString:()=> 'owner'}:{id,getString:k=>k==='type'?'tool_types':id},findCollectionByNameOrId:()=>({}),save:r=>{r.id='saved';records.push(r.values)}}
 const c={module:{exports:{}},__hooks:'hooks',require:()=>({freshUser:()=>user,audit:(...args)=>audits.push(args)}),Record,ForbiddenError:Error,BadRequestError:Error};vm.runInNewContext(fs.readFileSync('pb_hooks/lib/expert-client-assignments.js','utf8'),c)
 return {records,audits,run:body=>c.module.exports.createCustom({app,auth:user,requestInfo:()=>({body,query:{}}),request:{pathValue:()=> 'allocated-case'},json:(status,data)=>({status,data})})}
}
test('template-free requests create only case-specific assignments within the allocated case',()=>{
 for(const type of ['attachment_request','one_to_one_meeting']){
  const h=harness();assert.equal(h.run({type,name_ar:'اسم الأداة',config:{title:'Example'},case:'foreign-case',status:'completed',is_visible_to_user:false,assigned_expert:'foreign-expert'}).status,201)
  assert.equal(h.records[0].case,'allocated-case');assert.equal(h.records[0].status,'assigned');assert.equal(h.records[0].is_not_template,true);assert.equal(h.records[0].is_visible_to_user,true);assert.equal(h.records[0].assigned_expert,undefined);assert.equal(h.audits.length,1)
 }
})
test('foreign cases and nonexperts cannot create a tool assignment',()=>{
 for(const h of [harness('expert',false),harness('parent'),harness('admin')]){assert.throws(()=>h.run({type:'plan',name_en:'Plan',config:{title:'Example'}}));assert.equal(h.records.length,0)}
})
test('unknown types and empty, malformed or oversized configurations are rejected without saving',()=>{
 for(const body of ['plan','report','survey','multiple_answer'].map(type=>({type,name_en:'Template required',config:{x:1}})).concat([{type:'other',name_en:'Tool',config:{x:1}},{type:'plan',name_en:' ',config:{x:1}},{type:'plan',name_en:'Plan',config:[]},{type:'plan',name_en:'Plan',config:{}},{type:'plan',name_en:'Plan',config:{text:'x'.repeat(1000001)}}])){const h=harness();assert.throws(()=>h.run(body));assert.equal(h.records.length,0)}
})
