const engine = require(__hooks + "/lib/assessment-engine.js")
const policy = require(__hooks + "/lib/security-policy.js")
function json(record,key,fallback) { const raw=record.getString(key); if(!raw || raw === "null")return fallback; return JSON.parse(raw) }
function permit(app,user,key) { if(user.getString("role")==="super_admin")return true; return user.getString("role")==="admin"&&policy.effective(app,user).includes(key) }
function actor(e,permission="tools.read") {
 const u=policy.freshUser(e.app,e.auth)
 if(u.getString("role")!=="expert"&&!permit(e.app,u,permission))throw new ForbiddenError("Assessment access denied")
 return u
}
function manage(e,key) { const u=actor(e); if(!permit(e.app,u,key))throw new ForbiddenError("Permission required: "+key);return u }
function row(app,id){return app.findRecordById("assessments",id)}
function dto(r){return {id:r.id,name:r.getString("name"),code:r.getString("code"),status:r.getString("status"),version:r.getString("version"),definition:json(r,"definition",{}),tested:r.getBool("tested"),updated:r.getString("updated")}}
function find(app,table,filter,args){return app.findRecordsByFilter(table,filter,"",0,0,args||{})}
function allowedCase(app,u,id){
 if(permit(app,u,"cases.read"))return app.findRecordById("cases",id)
 if(u.getString("role")==="expert"&&find(app,"case_experts","case_id = {:case} && expert_id = {:user}",{case:id,user:u.id}).length)return app.findRecordById("cases",id)
 throw new ForbiddenError("Case access denied / لا تملك صلاحية الوصول للحالة")
}
function sessionAccess(app,u,id,write=false){
 const s=app.findRecordById("assessment_sessions",id)
 if(permit(app,u,write?"tools.update":"tools.read")){allowedCase(app,u,s.getString("case"));return s}
 if(u.getString("role")==="expert"){allowedCase(app,u,s.getString("case"));return s}
 throw new ForbiddenError("Session access denied")
}
function sessionDto(app,s,full=true){
 const value={id:s.id,assessment:s.getString("assessment"),case:s.getString("case"),operator:s.getString("operator"),recipient:s.getString("recipient"),assigned_at:s.getString("assigned_at"),submitted_at:s.getString("submitted_at"),status:s.getString("status"),snapshot:json(s,"snapshot",{}),population:json(s,"population",{}),created:s.getString("created"),answers:{}}
 if(full){const response=find(app,"assessment_responses","session = {:id}",{id:s.id})[0],result=find(app,"assessment_results","session = {:id}",{id:s.id})[0];value.answers=response?json(response,"answers",{}):{};if(result)value.result=json(result,"result",null)}
 return value
}
function population(value){
 const p=value||{};if(typeof p!=="object"||Array.isArray(p))throw new BadRequestError("Invalid population")
 const out={};if(p.age!==undefined&&p.age!==""){if(typeof p.age!=="number"||!isFinite(p.age)||p.age<0||p.age>150)throw new BadRequestError("Invalid age");out.age=p.age}
 for(const k of ["sex","language","group"])if(p[k]!==undefined){if(typeof p[k]!=="string"||p[k].length>100)throw new BadRequestError("Invalid population");out[k]=p[k]}
 return out
}
function body(e){return e.requestInfo().body||{}}
function run(e,action){
 const u=actor(e),b=body(e),id=e.request.pathValue("id")
 if(action==="list"){
  const admin=permit(e.app,u,"tools.read")
  const assessments=find(e.app,"assessments",admin?"id != ''":"status = 'published'",{}).map(dto)
  let cases=[]
  if(permit(e.app,u,"cases.read"))cases=find(e.app,"cases","id != ''",{})
  else if(u.getString("role")==="expert"){
   const seen={};for(const link of find(e.app,"case_experts","expert_id = {:id}",{id:u.id})){const cid=link.getString("case_id");if(!seen[cid]){seen[cid]=true;cases.push(e.app.findRecordById("cases",cid))}}
  }
  const caseIds=cases.map(r=>r.id)
  const sessions=find(e.app,"assessment_sessions","id != ''",{}).filter(s=>caseIds.includes(s.getString("case"))).map(s=>sessionDto(e.app,s,false))
  return {assessments,sessions,cases:cases.map(c=>({id:c.id,name:c.getString("name")})),canManage:permit(e.app,u,"tools.update"),canCreate:permit(e.app,u,"tools.create")}
 }
 if(action==="get"){const r=row(e.app,id);if(r.getString("status")!=="published"&&!permit(e.app,u,"tools.read"))throw new ForbiddenError();return definition(e.app,r)}
 if(action==="save"){
  manage(e,b.id?"tools.update":"tools.create")
  const d=b.definition
  if(!d||typeof d!=="object"||typeof d.name!=="string"||!d.name.trim()||d.name.length>200||typeof d.code!=="string"||!/^[A-Za-z][A-Za-z0-9_]{0,39}$/.test(d.code)||typeof d.version!=="string"||!d.version.trim()||d.version.length>40||!Array.isArray(d.questions)||d.questions.length>2000||JSON.stringify(d).length>4000000)throw new BadRequestError("Name, code and version are required; maximum 2000 questions")
  for(const v of [d.referencePeriod,d.respondentNotice])if(v!==undefined&&(typeof v!=="string"||v.length>12000))throw new BadRequestError("Invalid introduction text")
  let saved
  e.app.runInTransaction(app=>{
   const r=b.id?row(app,b.id):new Record(app.findCollectionByNameOrId("assessments"))
   if(b.id&&r.getString("status")!=="draft")throw new BadRequestError("Published versions are immutable; clone a new version / أنشئ نسخة جديدة لتعديل المقياس المنشور")
   r.set("name",d.name.trim());r.set("code",d.code);r.set("version",d.version.trim());r.set("status","draft");r.set("author",u.id);r.set("tested",false)
   const metadata=JSON.parse(JSON.stringify(d));delete metadata.questions;r.set("definition",metadata);app.save(r)
   for(const old of find(app,"assessment_questions","assessment = {:id}",{id:r.id}))app.delete(old)
   const keys={}
   for(const q of d.questions){if(!q||typeof q.id!=="string"||!/^[A-Za-z][A-Za-z0-9_]{0,39}$/.test(q.id)||keys[q.id])throw new BadRequestError("Invalid or duplicate question ID");keys[q.id]=true;const rec=new Record(app.findCollectionByNameOrId("assessment_questions"));rec.set("assessment",r.id);rec.set("key",q.id);rec.set("position",q.order);rec.set("definition",q);app.save(rec)}
   saved=definition(app,r)
  });return saved
 }
 if(action==="preview"){
  manage(e,"tools.update");let output
  e.app.runInTransaction(app=>{const r=row(app,id),d=definition(app,r).definition;output=engine.calculate(d,b.answers||{},population(b.population));if(output.complete){r.set("tested",true);app.save(r)}})
  return output
 }
 if(action==="publish"){
  manage(e,"tools.update");let saved
  e.app.runInTransaction(app=>{const r=row(app,id);if(r.getString("status")!=="draft"||!r.getBool("tested"))throw new BadRequestError("A complete successful preview is required before publication / اختبر المقياس بإجابات مكتملة أولاً");engine.validateDefinition(definition(app,r).definition);r.set("status","published");app.save(r);saved=definition(app,r)});return saved
 }
 if(action==="clone"){
  manage(e,"tools.create");let saved
  if(typeof b.version!=="string"||!b.version.trim()||b.version.length>40)throw new BadRequestError("New version is required")
  e.app.runInTransaction(app=>{const original=row(app,id),d=definition(app,original).definition;d.version=b.version.trim();const r=new Record(app.findCollectionByNameOrId("assessments"));for(const key of ["name","code"])r.set(key,original.getString(key));r.set("version",d.version);r.set("status","draft");r.set("author",u.id);const meta=JSON.parse(JSON.stringify(d));delete meta.questions;r.set("definition",meta);app.save(r);for(const q of d.questions){const qr=new Record(app.findCollectionByNameOrId("assessment_questions"));qr.set("assessment",r.id);qr.set("key",q.id);qr.set("position",q.order);qr.set("definition",q);app.save(qr)}saved=definition(app,r)});return saved
 }
 if(action==="start"){
  if(u.getString("role")!=="expert"&&!permit(e.app,u,"tools.create"))throw new ForbiddenError()
  let saved
  e.app.runInTransaction(app=>{allowedCase(app,u,b.case);const r=row(app,b.assessment);if(r.getString("status")!=="published")throw new BadRequestError("Assessment must be published");const d=definition(app,r).definition;engine.validateDefinition(d);const s=new Record(app.findCollectionByNameOrId("assessment_sessions"));s.set("assessment",r.id);s.set("case",b.case);s.set("operator",u.id);s.set("status","in_progress");s.set("snapshot",d);s.set("population",population(b.population));app.save(s);saved=sessionDto(app,s)});return saved
 }
 if(action==="session")return sessionDto(e.app,sessionAccess(e.app,u,id))
 if(action==="submit"){
  let saved
  e.app.runInTransaction(app=>{
   const s=sessionAccess(app,u,id,true)
   if(s.getString("recipient"))throw new ForbiddenError("Client-assigned responses can only be submitted by the client")
   if(s.getString("status")==="completed")throw new BadRequestError("Completed sessions are immutable")
   const d=json(s,"snapshot",{}),answers=b.answers||{}
   // Even draft responses must use IDs from the pinned definition.
   if(typeof answers!=="object"||Array.isArray(answers)||JSON.stringify(answers).length>300000)throw new BadRequestError("Invalid responses")
   for(const key of Object.keys(answers)){const q=d.questions.find(q=>q.id===key);if(!q||typeof answers[key]!=="string"||(answers[key]!==""&&!d.answerSets.find(x=>x.id===q.answerSet).options.some(o=>o.id===answers[key])))throw new BadRequestError("Invalid response: "+key)}
   const prior=find(app,"assessment_responses","session = {:id}",{id:s.id})[0],r=prior||new Record(app.findCollectionByNameOrId("assessment_responses"));r.set("session",s.id);r.set("answers",answers);app.save(r)
   if(b.finalize===true){const result=engine.calculate(d,answers,json(s,"population",{}));const prev=find(app,"assessment_results","session = {:id}",{id:s.id})[0],out=prev||new Record(app.findCollectionByNameOrId("assessment_results"));out.set("session",s.id);out.set("result",result);app.save(out);s.set("status",result.complete?"completed":"incomplete")}
   else {for(const old of find(app,"assessment_results","session = {:id}",{id:s.id}))app.delete(old);s.set("status","in_progress")}
   app.save(s);saved=sessionDto(app,s)
  });return saved
 }
 throw new BadRequestError("Unknown operation")
}
function definition(app,r){const out=dto(r);out.definition.questions=find(app,"assessment_questions","assessment = {:id}",{id:r.id}).map(q=>json(q,"definition",{})).sort((a,b)=>a.order-b.order);return out}
module.exports=(e,action)=>{
 try {const data=run(e,action);if(action==="list")for(const r of data.assessments)r.definition=definition(e.app,row(e.app,r.id)).definition;return e.json(200,data)}
 catch(error){if(error instanceof Error)throw new BadRequestError(error.message);throw error}
}
module.exports.helpers={json,permit,actor,allowedCase,find,definition,row,sessionDto,population}
