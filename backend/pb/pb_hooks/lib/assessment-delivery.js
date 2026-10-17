const h=require(__hooks+'/lib/assessments-api.js').helpers
const policy=require(__hooks+'/lib/security-policy.js')
const engine=require(__hooks+'/lib/assessment-engine.js')
function clientSession(app,u,id){
 const s=app.findRecordById('assessment_sessions',id)
 if(s.getString('recipient')!==u.id)throw new ForbiddenError('Assessment access denied')
 const c=app.findRecordById('cases',s.getString('case'))
 if(c.getString('user')!==u.id)throw new ForbiddenError('Case ownership changed')
 return s
}
function clientDto(app,s,full=true){
 const d=h.json(s,'snapshot',{}),c=app.findRecordById('cases',s.getString('case'))
 const out={id:s.id,case:c.id,caseName:c.getString('name'),name:d.name,version:d.version,language:d.language,instructions:d.instructions,referencePeriod:d.referencePeriod||"",respondentNotice:d.respondentNotice||"",status:s.getString('status'),created:s.getString('created'),submitted_at:s.getString('submitted_at'),questions:[],answers:{},minAnswered:d.minAnswered,requireAll:d.missingPolicy==='reject'}
 if(full){
  out.questions=d.questions.map(q=>({id:q.id,order:q.order,text:q.text,options:d.answerSets.find(a=>a.id===q.answerSet).options.map(o=>({id:o.id,label:o.label}))})).sort((a,b)=>a.order-b.order)
  const response=h.find(app,'assessment_responses','session = {:id}',{id:s.id})[0];out.answers=response?h.json(response,'answers',{}):{}
 }
 return out
}
function validateAnswers(d,answers){
 if(!answers||typeof answers!=='object'||Array.isArray(answers)||JSON.stringify(answers).length>300000)throw new BadRequestError('Invalid responses / إجابات غير صالحة')
 for(const key of Object.keys(answers)){
  const q=d.questions.find(q=>q.id===key)
  if(!q||typeof answers[key]!=='string'||(answers[key]!==''&&!d.answerSets.find(s=>s.id===q.answerSet).options.some(o=>o.id===answers[key])))throw new BadRequestError('Invalid answer / إجابة غير صالحة')
 }
}
module.exports=(e,action)=>{
 const u=policy.freshUser(e.app,e.auth),b=e.requestInfo().body||{},id=e.request.pathValue('id')
 if(action==='case'){
  h.actor(e);h.allowedCase(e.app,u,id)
  const sessions=h.find(e.app,'assessment_sessions','case = {:id}',{id}).map(s=>h.sessionDto(e.app,s,false))
  const assessments=h.find(e.app,'assessments','status = "published"',{}).map(r=>({id:r.id,name:r.getString('name'),version:r.getString('version')}))
  return e.json(200,{sessions,assessments,canAssign:u.getString('role')==='expert'||h.permit(e.app,u,'tools.create')})
 }
 if(action==='assign'){
  h.actor(e)
  if(u.getString('role')!=='expert'&&!h.permit(e.app,u,'tools.create'))throw new ForbiddenError('Assignment access denied')
  let saved
  e.app.runInTransaction(app=>{
   const c=h.allowedCase(app,u,b.case),recipient=app.findRecordById('users',c.getString('user'))
   if(!recipient.getBool('is_active'))throw new BadRequestError('The case owner must have an active account / يلزم حساب نشط للعميل المرتبط بالحالة')
   const assessment=h.row(app,b.assessment)
   if(assessment.getString('status')!=='published')throw new BadRequestError('Publish an approved assessment first / يجب نشر المقياس المعتمد أولًا')
   const existing=h.find(app,'assessment_sessions','assessment = {:assessment} && case = {:case} && recipient = {:recipient} && submitted_at = ""',{assessment:assessment.id,case:c.id,recipient:recipient.id})[0]
   if(existing){saved=h.sessionDto(app,existing);return}
   const d=h.definition(app,assessment).definition;engine.validateDefinition(d)
   const s=new Record(app.findCollectionByNameOrId('assessment_sessions'))
   s.set('assessment',assessment.id);s.set('case',c.id);s.set('operator',u.id);s.set('recipient',recipient.id);s.set('assigned_at',new Date().toISOString());s.set('status','assigned');s.set('snapshot',d);s.set('population',h.population(b.population));app.save(s)
   saved=h.sessionDto(app,s)
  })
  return e.json(200,saved)
 }
 if(action==='mine'){
  const sessions=h.find(e.app,'assessment_sessions','recipient = {:user}',{user:u.id}).filter(s=>{
   try{return e.app.findRecordById('cases',s.getString('case')).getString('user')===u.id}catch{return false}
  }).map(s=>clientDto(e.app,s,false))
  return e.json(200,{sessions})
 }
 if(action==='client')return e.json(200,clientDto(e.app,clientSession(e.app,u,id)))
 if(action==='respond'){
  let saved
  e.app.runInTransaction(app=>{
   const s=clientSession(app,u,id)
   if(s.getString('submitted_at')||s.getString('status')==='completed')throw new BadRequestError('Assessment already submitted / تم إرسال التقييم بالفعل')
   const d=h.json(s,'snapshot',{}),answers=b.answers||{};validateAnswers(d,answers)
   const count=d.questions.filter(q=>typeof answers[q.id]==='string'&&answers[q.id]!=='').length
   if(b.finalize===true&&(count<d.minAnswered||(d.missingPolicy==='reject'&&count!==d.questions.length)))throw new BadRequestError('Complete the required answers before submitting / أكمل الإجابات المطلوبة قبل الإرسال')
   const previous=h.find(app,'assessment_responses','session = {:id}',{id:s.id})[0],response=previous||new Record(app.findCollectionByNameOrId('assessment_responses'))
   response.set('session',s.id);response.set('answers',answers);app.save(response)
   if(b.finalize===true){
    let result
    try{result=engine.calculate(d,answers,h.json(s,'population',{}))}catch(error){throw new BadRequestError('Unable to submit the assessment. Contact the specialist / تعذر إرسال التقييم، يرجى مراجعة المختص')}
    const record=new Record(app.findCollectionByNameOrId('assessment_results'));record.set('session',s.id);record.set('result',result);app.save(record)
    s.set('status',result.complete?'completed':'incomplete');s.set('submitted_at',new Date().toISOString())
   }else s.set('status','in_progress')
   app.save(s);saved=clientDto(app,s)
  })
  return e.json(200,saved)
 }
 throw new BadRequestError('Unknown assessment delivery action')
}
