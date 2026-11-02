migrate(app => {
  const c = new Collection({name:"case_tool_templates",type:"base"})
  c.fields.add(new TextField({name:"name",required:true,max:250}))
  c.fields.add(new SelectField({name:"kind",required:true,maxSelect:1,values:["assessment","report","plan","survey","multiple_answer"]}))
  c.fields.add(new JSONField({name:"config",required:true,maxSize:1000000}))
  c.fields.add(new RelationField({name:"owner",collectionId:app.findCollectionByNameOrId("users").id,maxSelect:1}))
  c.fields.add(new RelationField({name:"source_assessment",collectionId:app.findCollectionByNameOrId("assessments").id,maxSelect:1}))
  c.fields.add(new AutodateField({name:"created",onCreate:true}))
  c.fields.add(new AutodateField({name:"updated",onCreate:true,onUpdate:true}))
  // All access is mediated by the scoped API; native writes and reads are locked.
  c.listRule=null;c.viewRule=null;c.createRule=null;c.updateRule=null;c.deleteRule=null
  app.save(c)
  const draft=new Collection({name:"case_tool_drafts",type:"base"})
  draft.fields.add(new RelationField({name:"owner",required:true,collectionId:app.findCollectionByNameOrId("users").id,maxSelect:1}))
  draft.fields.add(new RelationField({name:"case",required:true,collectionId:app.findCollectionByNameOrId("cases").id,maxSelect:1}))
  draft.fields.add(new TextField({name:"source",required:true,max:100}))
  draft.fields.add(new TextField({name:"name",required:true,max:250}))
  draft.fields.add(new JSONField({name:"config",required:true,maxSize:1000000}))
  draft.fields.add(new JSONField({name:"population",maxSize:10000}))
  draft.fields.add(new TextField({name:"assignment_id",max:40}))
  draft.fields.add(new TextField({name:"result_kind",max:40}))
  draft.fields.add(new AutodateField({name:"created",onCreate:true}))
  draft.fields.add(new AutodateField({name:"updated",onCreate:true,onUpdate:true}))
  draft.listRule=null;draft.viewRule=null;draft.createRule=null;draft.updateRule=null;draft.deleteRule=null;app.save(draft)
  const tasks=app.findCollectionByNameOrId("case_tools")
  let rule='@request.auth.id != "" && @request.auth.is_active = true && case.user = @request.auth.id && is_visible_to_user = true && (@request.body.status:isset = false || @request.body.status = "in_progress" || @request.body.status = "completed")'
  for(const field of tasks.fields)if(!["id","created","updated","responses","media","status"].includes(field.name))rule+=' && @request.body.'+field.name+':changed = false'
  if(!tasks.updateRule)throw new Error("Case tool permissions must be configured first.")
  if(!tasks.updateRule.includes(rule)){tasks.updateRule='('+tasks.updateRule+') || ('+rule+')';app.save(tasks)}
},()=>{throw new Error("Restore a reviewed backup to revert private templates.")})
