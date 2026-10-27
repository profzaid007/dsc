const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm')
const record=(id,values)=>({id,getString:key=>values[key]||''})
function run(missing=false){
 const calls=[];const user=record('parent-a',{role:'parent'});const owned=record('child-a',{name:'Child A'});
 const app={findCollectionByNameOrId:name=>{if(missing&&name==='assessment_sessions')throw Error('missing');return {}},findRecordsByFilter:(name,filter,sort,limit,offset,params)=>{calls.push({name,filter,params});if(name==='cases')return [owned];if(name==='case_tools')return [record('task-a',{case:'child-a',name_en:'Exercise',status:'pending',created:'2026-10-27'}),record('foreign-task',{case:'child-b'})];return [record('assessment-session',{case:'child-a',assessment:'scale',status:'assigned',created:'2026-10-26'}),record('foreign-session',{case:'child-b',assessment:'scale'})]},findRecordById:()=>record('scale',{name:'Assessment'})};
 const context={module:{exports:{}},__hooks:'hooks',require:path=>path.endsWith('case-owner-display.js') ? ()=>({type:'parent',name:'Parent A'}) : ({freshUser:()=>user}),ForbiddenError:Error,BadRequestError:Error};vm.runInNewContext(fs.readFileSync('pb_hooks/lib/client-assignments.js','utf8'),context)
 const response=context.module.exports({app,auth:user,json:(status,data)=>({status,data})});return {calls,response}
}
test('returns visible tasks and assessments with their child and excludes foreign cases',()=>{
 const {calls,response}=run();assert.equal(response.status,200);assert.equal(response.data.cases[0].owner_display.name,'Parent A');assert.ok(response.data.assignments.every(item=>item.owner_display.name==='Parent A'));assert.equal(response.data.assignments.length,2);assert.ok(response.data.assignments.every(item=>item.case==='child-a'&&item.caseName==='Child A'));
 const tasks=calls.find(x=>x.name==='case_tools');assert.match(tasks.filter,/case.user = .*is_visible_to_user = true/);assert.equal(tasks.params.user,'parent-a');
 const assessments=calls.find(x=>x.name==='assessment_sessions');assert.match(assessments.filter,/recipient = .*case.user =/);assert.equal(assessments.params.user,'parent-a');
})
test('missing assignment schema gives a named setup error rather than an empty list',()=>assert.throws(()=>run(true),/missing assessment_sessions/))
