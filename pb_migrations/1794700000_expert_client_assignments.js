function ownerRule(collection) {
 let rule = '@request.auth.id != "" && @request.auth.is_active = true && case.user = @request.auth.id && is_visible_to_user = true && (@request.body.status:isset = false || @request.body.status = "in_progress" || @request.body.status = "completed")'
 for (const field of collection.fields) {
   if (!["id", "created", "updated", "responses", "media", "status"].includes(field.name)) rule += " && @request.body." + field.name + ":changed = false"
 }
 return rule
}

migrate(app => {
 const lookup = app.findCollectionByNameOrId("lookups")
 const matches = app.findRecordsByFilter("lookups", 'type = "tool_types" && key = "multiple_answer"', "", 2, 0)
 if (matches.length > 1) throw new Error("Correct duplicate multiple_answer tool type records before applying this migration.")
 if (!matches.length) {
   const r = new Record(lookup)
   r.set("type", "tool_types");r.set("key", "multiple_answer")
   r.set("label_en", "Written assignment");r.set("label_ar", "تكليف كتابي");r.set("is_active",true)
   app.save(r)
 }
 const c = app.findCollectionByNameOrId("case_tools")
 const ownerResponseRule = ownerRule(c)
 if (!c.updateRule) throw new Error("case_tools updateRule is missing; correct assignment permissions before applying this migration.")
 if (!c.updateRule.includes(ownerResponseRule)) c.updateRule = "(" + c.updateRule + ") || (" + ownerResponseRule + ")"
 app.save(c)
}, app => {
 const c = app.findCollectionByNameOrId("case_tools")
 const ownerResponseRule = ownerRule(c)
 const suffix = ") || (" + ownerResponseRule + ")"
 if (c.updateRule.endsWith(suffix)) { c.updateRule = c.updateRule.slice(1,-suffix.length);app.save(c) }
 // Retain the tool type: existing assignments reference it.
})
