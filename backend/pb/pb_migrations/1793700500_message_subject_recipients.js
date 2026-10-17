// Existing messages may have no title; new messages require one.
migrate(app => {
 const c=app.findCollectionByNameOrId("internal_messages")
 if(!c.fields.getByName("subject")) c.fields.add(new TextField({name:"subject",max:200}))
 c.createRule='@request.auth.id != "" && @request.auth.is_active = true && sender = @request.auth.id && recipient != @request.auth.id && recipient.is_active = true && read = false && subject != "" && ((@request.auth.role = "expert" && (recipient.role = "admin" || recipient.role = "super_admin")) || @request.auth.role = "admin" || @request.auth.role = "super_admin")'
 c.updateRule += ' && @request.body.subject:changed = false'
 app.save(c)
},()=>{})
