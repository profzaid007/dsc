// Definitions are normalized into five collections. All writes go through validated routes.
migrate(app => {
 const users=app.findCollectionByNameOrId("users"), cases=app.findCollectionByNameOrId("cases")
 const make=(name,fields)=>{
  const c=new Collection({name,type:"base",listRule:null,viewRule:null,createRule:null,updateRule:null,deleteRule:null})
  for(const f of fields)c.fields.add(f)
  c.fields.add(new AutodateField({name:"created",onCreate:true}));c.fields.add(new AutodateField({name:"updated",onCreate:true,onUpdate:true}));app.save(c);return c
 }
 const relation=(name,id,required=true)=>new RelationField({name,collectionId:id,maxSelect:1,required,cascadeDelete:false})
 const a=make("assessments",[new TextField({name:"name",required:true,max:200}),new TextField({name:"code",required:true,max:40}),new TextField({name:"version",required:true,max:40}),new SelectField({name:"status",values:["draft","published","archived"],maxSelect:1,required:true}),new JSONField({name:"definition",maxSize:5000000}),new BoolField({name:"tested"}),relation("author",users.id)])
 make("assessment_questions",[relation("assessment",a.id),new TextField({name:"key",required:true,max:40}),new NumberField({name:"position",onlyInt:true}),new JSONField({name:"definition",maxSize:100000})])
 const s=make("assessment_sessions",[relation("assessment",a.id),relation("case",cases.id),relation("operator",users.id),new SelectField({name:"status",values:["in_progress","incomplete","completed"],maxSelect:1,required:true}),new JSONField({name:"snapshot",maxSize:5000000}),new JSONField({name:"population",maxSize:10000})])
 const r=make("assessment_responses",[relation("session",s.id),new JSONField({name:"answers",maxSize:500000})])
 r.indexes=['CREATE UNIQUE INDEX idx_assessment_response_session ON assessment_responses (session)'];app.save(r)
 const result=make("assessment_results",[relation("session",s.id),new JSONField({name:"result",maxSize:5000000})])
 result.indexes=['CREATE UNIQUE INDEX idx_assessment_result_session ON assessment_results (session)'];app.save(result)
 a.indexes=['CREATE UNIQUE INDEX idx_assessment_code_version ON assessments (code,version)'];app.save(a)
},()=>{throw new Error("Restore a reviewed backup to revert assessment data.")})
