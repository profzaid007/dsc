const policy=require(__hooks+"/lib/security-policy.js")
const h=require(__hooks+"/lib/assessments-api.js").helpers
const kinds=["assessment","report","plan","survey","multiple_answer"]
function actor(e,app,write=false){
 const u=policy.freshUser(app,e.auth)
 if(u.getString("role")!=="expert")policy.requirePermission(app,u,write?"tools.create":"tools.read")
 return u
}
function isAdmin(u){
 return ["admin","super_admin"].includes(u.getString("role"))
}
function clean(config){
 if(!config||typeof config!=="object"||Array.isArray(config)||JSON.stringify(config).length>900000)throw new BadRequestError("Invalid template configuration.")
 const copy=JSON.parse(JSON.stringify(config))
 for(const key of ["case","caseId","childName","expertName","user","recipient","responses"])delete copy[key]
 return copy
}
function dto(r){return {id:"saved:"+r.id,name:r.getString("name"),kind:r.getString("kind"),scope:r.getString("owner")?"private":"public",config:h.json(r,"config",{}),sourceAssessment:r.getString("source_assessment")}}
function load(app,u,id,review=false){
 const parts=String(id).split(":");if(parts.length!==2)throw new BadRequestError("Select a template.")
 if(parts[0]==="saved"){
  const r=app.findRecordById("case_tool_templates",parts[1]);if(r.getString("owner")&&r.getString("owner")!==u.id&&!review)throw new ForbiddenError("Private template access denied.")
  return dto(r)
 }
 if(parts[0]==="tool"){
  const r=app.findRecordById("tools",parts[1]);if(r.getString("status")!=="active")throw new BadRequestError("Inactive template.")
  const kind=app.findRecordById("lookups",r.getString("type")).getString("key")
  if(!kinds.includes(kind)||kind==="assessment")throw new BadRequestError("Unsupported template.")
  return {id,name:r.getString("name_ar")||r.getString("name_en"),kind,scope:"public",config:clean(h.json(r,"config",{})),sourceAssessment:""}
 }
 if(parts[0]==="assessment"){
  const r=app.findRecordById("assessments",parts[1]);if(r.getString("status")!=="published")throw new BadRequestError("Publish the assessment first.")
  return {id,name:r.getString("name"),kind:"assessment",scope:"public",config:h.definition(app,r).definition,sourceAssessment:r.id}
 }
 throw new BadRequestError("Unknown template.")
}
function validate(t){
 if(!kinds.includes(t.kind)||typeof t.name!=="string"||!t.name.trim()||t.name.length>250)throw new BadRequestError("Enter a template name and type.")
 t.config=clean(t.config)
 if(!Object.keys(t.config).length)throw new BadRequestError("Complete the template.")
 if(t.kind==="plan"&&(!Array.isArray(t.config.goals)||!Array.isArray(t.config.steps)))throw new BadRequestError("Add plan goals and steps.")
 if(t.kind==="report"&&!Array.isArray(t.config.customFields))throw new BadRequestError("Configure report fields.")
 if(["survey","multiple_answer"].includes(t.kind)){
  if(!Array.isArray(t.config.questions)||!t.config.questions.length||t.config.questions.some(q=>!q.id||typeof q.text!=="string"||!q.text.trim()))throw new BadRequestError("Add the template questions.")
  if(t.kind==="survey"&&(!Array.isArray(t.config.options)||!t.config.options.length))throw new BadRequestError("Add survey answer options.")
 }
 if(t.kind==="assessment")require(__hooks+"/lib/assessment-engine.js").validateDefinition(t.config)
 return t
}
function list(e){
 const u=actor(e,e.app),out=[]
 const review=isAdmin(u)&&e.request.url.query().get("review")==="1"
 const saved=review?h.find(e.app,"case_tool_templates","",{}):h.find(e.app,"case_tool_templates",'owner = "" || owner = {:id}',{id:u.id})
 for(const r of saved)out.push(dto(r))
 const types={};for(const r of h.find(e.app,"lookups",'type = "tool_types"',{}))types[r.id]=r.getString("key")
 for(const r of h.find(e.app,"tools",'status = "active"',{})){
  const kind=types[r.getString("type")]
  if(kinds.includes(kind))out.push({id:"tool:"+r.id,name:r.getString("name_ar")||r.getString("name_en"),kind,scope:"public"})
 }
 for(const r of h.find(e.app,"assessments",'status = "published"',{}))out.push({id:"assessment:"+r.id,name:r.getString("name"),kind:"assessment",scope:"public"})
 return e.json(200,{templates:out.map(t=>({id:t.id,name:t.name,kind:t.kind,scope:t.scope}))})
}
function detail(e){const u=actor(e,e.app);return e.json(200,load(e.app,u,e.request.pathValue("id"),isAdmin(u)))}
function approve(e){
 let result
 e.app.runInTransaction(app=>{
  const u=actor(e,app)
  if(!isAdmin(u))throw new ForbiddenError()
  policy.requirePermission(app,u,"tools.create")
  const [type,id,extra]=e.request.pathValue("id").split(":")
  if(type!=="saved"||!id||extra!==undefined)throw new BadRequestError("Select a saved private template.")
  const r=app.findRecordById("case_tool_templates",id)
  const owner=r.getString("owner")
  if(owner){
   const t=validate(dto(r))
   r.set("config",t.config)
   r.set("owner","")
   app.save(r)
   policy.audit(app,u,"template.approve","case_tool_templates",r.id,{owner},{kind:t.kind,private:false})
  }
  result=dto(r)
 })
 return e.json(200,result)
}
function save(e){
 let result
 e.app.runInTransaction(app=>{
  const u=actor(e,app,true),body=e.requestInfo().body,t=validate({name:body.name,kind:body.kind,config:body.config})
  let source=""
  if(t.kind==="assessment"){
   if(typeof body.source!=="string")throw new BadRequestError("Choose a published assessment template.")
   const original=load(app,u,body.source);if(original.kind!=="assessment")throw new BadRequestError("Invalid source assessment.")
   source=original.sourceAssessment
  }
  const r=new Record(app.findCollectionByNameOrId("case_tool_templates"))
  r.set("name",t.name.trim());r.set("kind",t.kind);r.set("config",t.config);r.set("owner",u.getString("role")==="expert"?u.id:"");r.set("source_assessment",source);app.save(r)
  policy.audit(app,u,"template.create","case_tool_templates",r.id,null,{kind:t.kind,private:!!r.getString("owner")})
  result=dto(r)
 })
 return e.json(201,result)
}
function drafts(e){
 const u=actor(e,e.app),caseId=e.request.pathValue("id");h.allowedCase(e.app,u,caseId)
 return e.json(200,{drafts:h.find(e.app,"case_tool_drafts",'owner = {:owner} && case = {:case} && assignment_id = ""',{owner:u.id,case:caseId}).map(r=>({id:r.id,source:r.getString("source"),name:r.getString("name"),config:h.json(r,"config",{}),population:h.json(r,"population",{})}))})
}
function saveDraft(e){
 let result
 e.app.runInTransaction(app=>{
  const u=actor(e,app,true),body=e.requestInfo().body,c=h.allowedCase(app,u,e.request.pathValue("id")),original=load(app,u,body.source)
  const t=validate({name:body.name,kind:original.kind,config:body.config})
  const r=new Record(app.findCollectionByNameOrId("case_tool_drafts"))
  r.set("owner",u.id);r.set("case",c.id);r.set("source",original.id);r.set("name",t.name.trim());r.set("config",t.config);r.set("population",h.population(body.population));app.save(r)
  result={id:r.id,source:original.id,name:t.name.trim(),config:t.config,population:h.population(body.population)}
 })
 return e.json(201,result)
}
function assign(e){
 let result
 e.app.runInTransaction(app=>{
  const u=actor(e,app,true),request=e.requestInfo().body,caseId=e.request.pathValue("id")
  const c=h.allowedCase(app,u,caseId),recipient=app.findRecordById("users",c.getString("user"))
  if(typeof request.draft!=="string"||!request.draft)throw new BadRequestError("Save the draft before sending.")
  const draft=app.findRecordById("case_tool_drafts",request.draft)
  if(draft.getString("owner")!==u.id||draft.getString("case")!==caseId)throw new ForbiddenError("Draft access denied.")
  if(draft.getString("assignment_id")){result={id:draft.getString("assignment_id"),kind:draft.getString("result_kind")};return}
  const body={source:draft.getString("source"),name:draft.getString("name"),config:h.json(draft,"config",{}),population:h.json(draft,"population",{})}
  if(!recipient.getBool("is_active"))throw new BadRequestError("The case owner must have an active account.")
  const original=load(app,u,body.source),t=validate({name:body.name,kind:original.kind,config:body.config})
  if(t.kind==="assessment"){
   const r=new Record(app.findCollectionByNameOrId("assessment_sessions"))
   t.config.name=t.name.trim()
   r.set("assessment",original.sourceAssessment);r.set("case",c.id);r.set("operator",u.id);r.set("recipient",recipient.id);r.set("assigned_at",new Date().toISOString());r.set("status","assigned");r.set("snapshot",t.config);r.set("population",h.population(body.population));app.save(r)
   result={id:r.id,kind:t.kind}
  }else{
   const type=app.findFirstRecordByFilter("lookups",'type = "tool_types" && key = {:key}',{key:t.kind})
   const r=new Record(app.findCollectionByNameOrId("case_tools"))
   const config=JSON.parse(JSON.stringify(t.config));config.childName=c.getString("name");config.expertName=u.getString("name");config.templateWorkflow=true;config.templateKind=t.kind
   r.set("case",c.id);r.set("type",type.id);r.set("name_en",t.name.trim());r.set("name_ar",t.name.trim());r.set("config",config);r.set("status","assigned");r.set("is_not_template",false);r.set("is_visible_to_user",true);r.set("responses",{});r.set("assigned_at",new Date().toISOString());app.save(r)
   result={id:r.id,kind:t.kind}
  }
  policy.audit(app,u,"assignment.create",t.kind==="assessment"?"assessment_sessions":"case_tools",result.id,null,{case:c.id,source:body.source})
  draft.set("assignment_id",result.id);draft.set("result_kind",result.kind);app.save(draft)
 })
 return e.json(201,result)
}
module.exports={list,detail,save,approve,assign,drafts,saveDraft}
